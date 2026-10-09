"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronRight, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel, PanelList } from "@/components/dashboard/Panel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { api, type MemberRow } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { MEMBER_STATUSES, statusMeta } from "@/lib/member-status";
import { formatDate, initials } from "@/lib/dash-utils";

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

  const removeUser = async (id: string, email: string) => {
    if (!window.confirm(`Remove ${email}? This cannot be undone from the UI.`)) return;
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
    <div className="flex flex-col gap-6">
      <DashHeader
        title="Users"
        description={
          users
            ? `${filtered.length} of ${users.length} member${users.length === 1 ? "" : "s"}`
            : "Manage members, roles and renewals."
        }
        actions={
          <>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL)}>
              <SelectTrigger className="w-40">
                <SelectValue>
                  {statusFilter === ALL ? "All statuses" : statusMeta(statusFilter).label}
                </SelectValue>
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
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by email…"
                className="pl-9"
              />
            </div>
          </>
        }
      />

      <Panel>
        {loading && <ListSkeleton rows={4} />}
        {error && <p className="px-5 py-4 text-sm text-destructive">{error}</p>}
        {users && filtered.length === 0 && (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Try a different search or status filter."
          />
        )}
        <PanelList>
          {filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onRoleChange={updateRole}
              onRemove={removeUser}
              onExtend={extendUser}
            />
          ))}
        </PanelList>
      </Panel>
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
  onRemove: (id: string, email: string) => void;
  onExtend: (id: string) => void;
}) {
  const selectableRole =
    user.role === "admin" ? "ADMIN" : user.role === "member" ? "MEMBER" : undefined;
  const canExtend = user.status === "APPROVED" || user.status === "EXPIRED";

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {initials(user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{user.email}</p>
            {user.status && <StatusBadge status={user.status} />}
          </div>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(user.registration_date)}
            {user.membership_expires_at && ` · expires ${formatDate(user.membership_expires_at)}`}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Select
          defaultValue={selectableRole}
          onValueChange={(value) => value && onRoleChange(user.id, value as "ADMIN" | "MEMBER")}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder={<span className="capitalize">{user.role}</span>}>
              {selectableRole ? (selectableRole === "ADMIN" ? "Admin" : "Member") : undefined}
            </SelectValue>
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
          onClick={() => onRemove(user.id, user.email)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
