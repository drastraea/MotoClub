"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Check,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  LayoutTemplate,
  Megaphone,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel, PanelHeader, PanelList } from "@/components/dashboard/Panel";
import { StatTile } from "@/components/dashboard/StatTile";
import { api, type MemberRow } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import {
  RENEWAL_WINDOW_DAYS,
  daysUntil,
  formatDate,
  greeting,
  initials,
  relativeDays,
  todayISO,
} from "@/lib/dash-utils";

const quickActions = [
  { href: "/admin/events?new=1", label: "New event", icon: CalendarPlus },
  { href: "/admin/announcements?new=1", label: "New announcement", icon: Megaphone },
  { href: "/admin/gallery", label: "Upload photos", icon: ImagePlus },
  { href: "/admin/site", label: "Edit landing page", icon: LayoutTemplate },
];

function isRenewalDue(m: MemberRow): boolean {
  if (m.status === "EXPIRED") return true;
  return (
    m.status === "APPROVED" &&
    !!m.membership_expires_at &&
    daysUntil(m.membership_expires_at) <= RENEWAL_WINDOW_DAYS
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <div className="flex items-center gap-2 bg-muted/40 px-5 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
      <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] tabular-nums ring-1 ring-border">
        {count}
      </span>
    </div>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const registrations = useApiData(useCallback(() => api.getRegistrations(), []), []);
  const members = useApiData(useCallback(() => api.getMembers(), []), []);
  const events = useApiData(useCallback(() => api.getEvents(), []), []);
  const announcements = useApiData(useCallback(() => api.getAnnouncements(), []), []);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = registrations.data ?? [];

  const renewals = useMemo(
    () =>
      (members.data ?? [])
        .filter(isRenewalDue)
        .sort((a, b) =>
          (a.membership_expires_at ?? "").localeCompare(b.membership_expires_at ?? "")
        ),
    [members.data]
  );

  const upcoming = useMemo(() => {
    const today = todayISO();
    return (events.data ?? [])
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events.data]);

  const latestNews = (announcements.data ?? []).slice(0, 3);

  const attentionLoading = registrations.loading || members.loading;
  const attentionEmpty = !attentionLoading && pending.length === 0 && renewals.length === 0;

  const decide = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !window.confirm("Reject this application?")) return;
    setBusyId(id);
    try {
      await api.setMemberStatus(id, action);
      toast.success(action === "APPROVE" ? "Application approved" : "Application rejected");
      await Promise.all([registrations.reload(), members.reload()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const extend = async (id: string) => {
    setBusyId(id);
    try {
      await api.extendMembership(id);
      toast.success("Membership extended by 3 years");
      await members.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extend failed");
    } finally {
      setBusyId(null);
    }
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Here's what needs your attention today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          href="/admin/members"
          icon={UserCheck}
          label="Pending applications"
          value={pending.length}
          loading={registrations.loading}
          tone={pending.length > 0 ? "attention" : "default"}
        />
        <StatTile
          href="/admin/users"
          icon={Users}
          label="Total members"
          value={members.data?.length}
          loading={members.loading}
        />
        <StatTile
          href="/admin/users"
          icon={CalendarX}
          label="Renewals due"
          value={renewals.length}
          loading={members.loading}
          tone={renewals.length > 0 ? "attention" : "default"}
        />
        <StatTile
          href="/admin/events"
          icon={CalendarDays}
          label="Upcoming events"
          value={upcoming.length}
          loading={events.loading}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Needs attention"
            description="Applications to review and memberships due for renewal."
          />

          {attentionLoading && <ListSkeleton />}
          {(registrations.error || members.error) && (
            <p className="px-5 py-4 text-sm text-destructive">
              {registrations.error ?? members.error}
            </p>
          )}

          {attentionEmpty && !registrations.error && !members.error && (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up"
              description="No pending applications and no memberships due for renewal."
            />
          )}

          {!attentionLoading && pending.length > 0 && (
            <>
              <SectionLabel count={pending.length}>Pending applications</SectionLabel>
              <PanelList>
                {pending.slice(0, 5).map((r) => (
                  <div
                    key={r.member_id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {initials(r.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.email} · applied {formatDate(r.registered_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.member_id}
                        onClick={() => decide(r.member_id, "REJECT")}
                      >
                        <X className="size-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={busyId === r.member_id}
                        onClick={() => decide(r.member_id, "APPROVE")}
                      >
                        <Check className="size-4" />
                        Approve
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`View ${r.name}`}
                        nativeButton={false}
                        render={<Link href={`/admin/members/${r.member_id}?from=applications`} />}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </PanelList>
              {pending.length > 5 && (
                <Link
                  href="/admin/members"
                  className="block border-t border-border px-5 py-2.5 text-center text-xs font-medium text-primary hover:underline"
                >
                  View all {pending.length} applications
                </Link>
              )}
            </>
          )}

          {!attentionLoading && renewals.length > 0 && (
            <>
              <SectionLabel count={renewals.length}>Membership renewals</SectionLabel>
              <PanelList>
                {renewals.slice(0, 5).map((m) => {
                  const expired = m.status === "EXPIRED";
                  const days = m.membership_expires_at ? daysUntil(m.membership_expires_at) : 0;
                  return (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                          {initials(m.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.membership_expires_at
                            ? `${expired ? "Expired" : "Expires"} ${formatDate(m.membership_expires_at)} (${relativeDays(days)})`
                            : "No expiry date"}
                        </p>
                      </div>
                      <Badge variant={expired ? "destructive" : "secondary"}>
                        {expired ? "Expired" : "Due soon"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === m.id}
                          onClick={() => extend(m.id)}
                        >
                          <CalendarPlus className="size-4" />
                          Extend +3y
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`View ${m.email}`}
                          nativeButton={false}
                          render={<Link href={`/admin/members/${m.id}`} />}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </PanelList>
              {renewals.length > 5 && (
                <Link
                  href="/admin/users"
                  className="block border-t border-border px-5 py-2.5 text-center text-xs font-medium text-primary hover:underline"
                >
                  View all {renewals.length} renewals
                </Link>
              )}
            </>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Quick actions" />
            <PanelList>
              {quickActions.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  {label}
                  <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </PanelList>
          </Panel>

          <Panel>
            <PanelHeader
              title="Upcoming events"
              action={
                <Link href="/admin/events" className="text-xs font-medium text-primary hover:underline">
                  Manage
                </Link>
              }
            />
            {events.loading && <ListSkeleton rows={2} />}
            {!events.loading && upcoming.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming events"
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/admin/events?new=1" />}
                  >
                    <CalendarPlus className="size-4" />
                    Create event
                  </Button>
                }
              />
            )}
            <PanelList>
              {upcoming.slice(0, 4).map((e) => {
                const [, month, day] = e.date.split("-");
                const monthName = new Date(2000, Number(month) - 1, 1).toLocaleString("en-GB", {
                  month: "short",
                });
                return (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
                      <span className="text-sm font-semibold tabular-nums">{Number(day)}</span>
                      <span className="mt-0.5 text-[10px] text-muted-foreground uppercase">
                        {monthName}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {relativeDays(daysUntil(e.date))}
                        {!e.is_public && " · private"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </PanelList>
          </Panel>

          <Panel>
            <PanelHeader
              title="Latest announcements"
              action={
                <Link
                  href="/admin/announcements"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Manage
                </Link>
              }
            />
            {announcements.loading && <ListSkeleton rows={2} />}
            {!announcements.loading && latestNews.length === 0 && (
              <EmptyState icon={Megaphone} title="No announcements yet" />
            )}
            <PanelList>
              {latestNews.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    {a.is_public && (
                      <Badge variant="secondary" className="shrink-0">
                        Public
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {a.last_updated_at} · {a.description}
                  </p>
                </div>
              ))}
            </PanelList>
          </Panel>
        </div>
      </div>
    </div>
  );
}
