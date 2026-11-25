"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  ChevronRight,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
import { usePendingCount } from "@/hooks/usePendingCount";
import { RENEWAL_WINDOW_DAYS, daysUntil, formatDate, initials } from "@/lib/dash-utils";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "due", label: "Due soon" },
  { key: "expired", label: "Expired" },
  { key: "pending", label: "Pending" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function bucket(m: MemberRow): FilterKey | "other" {
  if (m.status === "PENDING_APPROVAL") return "pending";
  if (m.status === "EXPIRED") return "expired";
  if (m.status === "APPROVED") {
    const due = !!m.membership_expires_at && daysUntil(m.membership_expires_at) <= RENEWAL_WINDOW_DAYS;
    return due ? "due" : "active";
  }
  return "other"; // rejected, or an admin without a membership
}

type SortKey = "email" | "registration_date" | "membership_expires_at";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "registration_date", dir: -1 });
  const [sheet, setSheet] = useState<MemberRow | null>(null);
  const pending = usePendingCount();
  const { data: users, loading, error, reload } = useApiData(
    useCallback(() => api.getMembers(), []),
    []
  );

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: 0, active: 0, due: 0, expired: 0, pending: 0 };
    for (const m of users ?? []) {
      c.all++;
      const b = bucket(m);
      if (b !== "other") c[b]++;
    }
    return c;
  }, [users]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => (filter === "all" || bucket(u) === filter) && (!q || u.email.toLowerCase().includes(q)))
      .sort((a, b) => {
        const av = a[sort.key] ?? "";
        const bv = b[sort.key] ?? "";
        return av.localeCompare(bv) * sort.dir;
      });
  }, [users, query, filter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

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
      setSheet(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const extendUser = async (id: string) => {
    try {
      await api.extendMembership(id);
      toast.success("Membership extended by 3 years");
      setSheet(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extend failed");
    }
  };

  const actions = { onRole: updateRole, onRemove: removeUser, onExtend: extendUser };

  return (
    <div className="flex flex-col gap-5">
      <DashHeader
        title="Members"
        description={users ? `${counts.all} in the club` : "Manage members, roles and renewals."}
      />

      {!!pending && pending > 0 && (
        <Link
          href="/admin/members"
          className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium ring-1 ring-primary/30"
        >
          <UserCheck className="size-5 text-primary" />
          <span className="flex-1">
            {pending} application{pending === 1 ? "" : "s"} waiting for review
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      )}

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email…"
          className="h-10 pl-9"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter members">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-muted-foreground ring-border hover:text-foreground"
            )}
          >
            {label}
            <span className="text-xs tabular-nums opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {loading && <ListSkeleton rows={4} />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {users && rows.length === 0 && (
        <Panel>
          <EmptyState icon={Users} title="No members found" description="Try a different search or filter." />
        </Panel>
      )}

      {rows.length > 0 && (
        <>
          {/* Phone: tap a row for its actions. */}
          <Panel className="md:hidden">
            <PanelList>
              {rows.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSheet(u)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/60"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {initials(u.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{u.email}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {u.membership_expires_at
                        ? `Expires ${formatDate(u.membership_expires_at)}`
                        : `Joined ${formatDate(u.registration_date)}`}
                    </span>
                  </span>
                  {u.status && <StatusBadge status={u.status} />}
                </button>
              ))}
            </PanelList>
          </Panel>

          {/* Desktop: sortable table with inline actions. */}
          <Panel className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <SortHead label="Member" k="email" sort={sort} onSort={toggleSort} />
                  <th className="px-3 py-3 font-medium">Status</th>
                  <SortHead label="Joined" k="registration_date" sort={sort} onSort={toggleSort} />
                  <SortHead label="Expires" k="membership_expires_at" sort={sort} onSort={toggleSort} />
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((u) => (
                  <TableRow key={u.id} user={u} {...actions} />
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      <Dialog open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 gap-1 rounded-b-none p-4 pb-8 sm:max-w-none"
        >
          {sheet && <SheetBody user={sheet} {...actions} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortHead({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <th className="px-5 py-3 font-medium" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => onSort(k)} className="flex items-center gap-1 hover:text-foreground">
        {label}
        {active && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </button>
    </th>
  );
}

type Actions = {
  onRole: (id: string, role: "ADMIN" | "MEMBER") => void;
  onRemove: (id: string, email: string) => void;
  onExtend: (id: string) => void;
};

function roleOf(user: MemberRow) {
  return user.role === "admin" ? "ADMIN" : user.role === "member" ? "MEMBER" : undefined;
}
const canExtend = (u: MemberRow) => u.status === "APPROVED" || u.status === "EXPIRED";

function TableRow({ user, onRole, onRemove, onExtend }: { user: MemberRow } & Actions) {
  const role = roleOf(user);
  return (
    <tr>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials(user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{user.email}</span>
        </div>
      </td>
      <td className="px-3 py-3">{user.status && <StatusBadge status={user.status} />}</td>
      <td className="px-5 py-3 text-muted-foreground">{formatDate(user.registration_date)}</td>
      <td className="px-5 py-3 text-muted-foreground">
        {user.membership_expires_at ? formatDate(user.membership_expires_at) : "—"}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-2">
          <Select defaultValue={role} onValueChange={(v) => v && onRole(user.id, v as "ADMIN" | "MEMBER")}>
            <SelectTrigger size="sm" className="w-28">
              <SelectValue placeholder={<span className="capitalize">{user.role}</span>}>
                {role ? (role === "ADMIN" ? "Admin" : "Member") : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          {canExtend(user) && (
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
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/admin/members/${user.id}`} />}>
            View
            <ChevronRight className="size-4" />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="Remove member" onClick={() => onRemove(user.id, user.email)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function SheetBody({ user, onRole, onRemove, onExtend }: { user: MemberRow } & Actions) {
  const role = roleOf(user);
  const item = "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors hover:bg-muted active:bg-muted";
  return (
    <>
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
      <DialogTitle className="truncate text-base">{user.email}</DialogTitle>
      <DialogDescription className="mb-2 flex items-center gap-2">
        {user.status && <StatusBadge status={user.status} />}
        {user.membership_expires_at && <span>Expires {formatDate(user.membership_expires_at)}</span>}
      </DialogDescription>
      <Link href={`/admin/members/${user.id}`} className={item}>
        <User className="size-5 text-muted-foreground" />
        View profile
      </Link>
      {canExtend(user) && (
        <button type="button" className={item} onClick={() => onExtend(user.id)}>
          <CalendarPlus className="size-5 text-muted-foreground" />
          Extend +3 years
        </button>
      )}
      {role && (
        <button
          type="button"
          className={item}
          onClick={() => onRole(user.id, role === "ADMIN" ? "MEMBER" : "ADMIN")}
        >
          <Shield className="size-5 text-muted-foreground" />
          {role === "ADMIN" ? "Make member" : "Make admin"}
        </button>
      )}
      <button type="button" className={cn(item, "text-destructive")} onClick={() => onRemove(user.id, user.email)}>
        <Trash2 className="size-5" />
        Remove member
      </button>
    </>
  );
}
