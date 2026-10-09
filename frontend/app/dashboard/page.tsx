"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, ChevronRight, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { MemberIdCard } from "@/components/dashboard/MemberIdCard";
import { Panel, PanelHeader, PanelList } from "@/components/dashboard/Panel";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import {
  RENEWAL_WINDOW_DAYS,
  daysUntil,
  formatDate,
  greeting,
  relativeDays,
  todayISO,
} from "@/lib/dash-utils";

export default function MemberHome() {
  const { user } = useAuth();
  const memberId = user?.id;

  const profile = useApiData(
    useCallback(() => {
      if (!memberId) return Promise.reject(new Error("Not signed in"));
      return api.getProfile(memberId);
    }, [memberId]),
    [memberId]
  );
  const events = useApiData(useCallback(() => api.getEvents(), []), []);
  const news = useApiData(useCallback(() => api.getAnnouncements(), []), []);

  const upcoming = useMemo(() => {
    const today = todayISO();
    return (events.data ?? [])
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [events.data]);

  const latestNews = (news.data ?? []).slice(0, 4);

  const p = profile.data;
  const expiry = p?.membershipExpiresAt ?? null;
  const days = expiry ? daysUntil(expiry) : null;
  const expired = p?.status === "EXPIRED";
  const dueSoon = !expired && days !== null && days <= RENEWAL_WINDOW_DAYS;

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Your membership and what's coming up at the club."
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/profile" />}
          >
            View profile
            <ChevronRight className="size-4" />
          </Button>
        }
      />

      {profile.loading && <div className="h-64 animate-pulse rounded-2xl bg-muted" />}
      {profile.error && <p className="text-sm text-destructive">{profile.error}</p>}

      {p && memberId && (
        <>
          {(expired || dueSoon) && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-sm ring-1 ring-primary/30"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                {expired ? (
                  <>
                    Your membership expired on <strong>{expiry && formatDate(expiry)}</strong>.
                    Contact a club admin to renew it.
                  </>
                ) : (
                  <>
                    Your membership expires on <strong>{expiry && formatDate(expiry)}</strong> (
                    {days !== null && relativeDays(days)}). Contact a club admin to renew.
                  </>
                )}
              </p>
            </div>
          )}
          <MemberIdCard profile={p} memberId={memberId} />
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Upcoming events"
            action={
              <Link href="/#events" className="text-xs font-medium text-primary hover:underline">
                See all
              </Link>
            }
          />
          {events.loading && <ListSkeleton rows={2} />}
          {!events.loading && upcoming.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events"
              description="New rides and meetups will show up here."
            />
          )}
          <PanelList>
            {upcoming.map((e) => {
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
                      {formatDate(e.date)} · {relativeDays(daysUntil(e.date))}
                    </p>
                  </div>
                </div>
              );
            })}
          </PanelList>
        </Panel>

        <Panel>
          <PanelHeader
            title="Announcements"
            action={
              <Link
                href="/#announcements"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all
              </Link>
            }
          />
          {news.loading && <ListSkeleton rows={2} />}
          {!news.loading && latestNews.length === 0 && (
            <EmptyState
              icon={Megaphone}
              title="Nothing new"
              description="Club announcements will appear here."
            />
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
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {a.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{a.last_updated_at}</p>
              </div>
            ))}
          </PanelList>
        </Panel>
      </div>
    </div>
  );
}
