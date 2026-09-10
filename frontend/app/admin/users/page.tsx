"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronRight, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type MemberRow } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { MEMBER_STATUSES, statusMeta } from "@/lib/member-status";

const ALL = "ALL";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const { data: users, loading, error, reload } = useApiData(
    useCallback(
      () => api.getMembers(statusFilter === ALL ? undefined : statusFilter),
      [statusFilter]
    ),
    [statusFilter]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users ?? [];
    return (users ?? []).filter((u) => u.email.toLowerCase().includes(q));
  }, [users, query]);

  // POST /members/:id { role } — superadmin only; admins receive 403.
  const updateRole = async (id: string, role: "ADMIN" | "MEMBER") => {
    try {
      await api.updateMemberRole(id, role);
      toast.success("Role updated");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const removeUser = async (id: string) => {
    try {
      await api.deleteMember(id);
      toast.success("Member removed");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const extendUser = async (id: string) => {
    try {
      await api.extendMembership(id);
      toast.success("Membership extended by 3 years");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extend failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
            User Management
          </h1>
          {users && (
            <p className="mt-1 text-muted-foreground">
              {filtered.length} of {users.length} member{users.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {MEMBER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusMeta(s).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email…"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error}</p>}
      {users && filtered.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No members found.</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {filtered.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            onRoleChange={updateRole}
            onRemove={removeUser}
            onExtend={extendUser}
          />
        ))}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onRoleChange,
  onRemove,
  onExtend,
}: {
  user: MemberRow;
  onRoleChange: (id: string, role: "ADMIN" | "MEMBER") => void;
  onRemove: (id: string) => void;
  onExtend: (id: string) => void;
}) {
  const selectableRole = user.role === "admin" ? "ADMIN" : user.role === "member" ? "MEMBER" : undefined;
  const canExtend = user.status === "APPROVED" || user.status === "EXPIRED";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary uppercase">
              {user.email[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{user.email}</p>
              {user.status && (
                <Badge variant={statusMeta(user.status).badge} className="shrink-0">
                  {statusMeta(user.status).label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Joined {user.registration_date}
              {user.membership_expires_at && ` · expires ${user.membership_expires_at}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select
            defaultValue={selectableRole}
            onValueChange={(value) => onRoleChange(user.id, value as "ADMIN" | "MEMBER")}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder={user.role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          {canExtend && (
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Extend membership by 3 years"
              title="Extend membership (+3 years)"
              onClick={() => onExtend(user.id)}
            >
              <CalendarPlus className="size-4" />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/admin/members/${user.id}`} />}
          >
            View
            <ChevronRight className="size-4" />
          </Button>

          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Remove member"
            onClick={() => onRemove(user.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
