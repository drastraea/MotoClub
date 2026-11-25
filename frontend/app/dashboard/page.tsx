"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Gift,
  Images,
  MapPin,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateBlock } from "@/components/shared/DateBlock";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { MemberIdCard } from "@/components/dashboard/MemberIdCard";
import { Panel, PanelHeader, PanelList } from "@/components/dashboard/Panel";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import { useNextRide } from "@/hooks/useNextRide";
import {
  RENEWAL_WINDOW_DAYS,
  daysUntil,
  formatDate,
  greeting,
  relativeDays,
} from "@/lib/dash-utils";

const ART = {
  background:
    "radial-gradient(70% 60% at 75% 25%, rgba(245,158,11,.30), transparent 62%), repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,.04) 38px 40px), linear-gradient(160deg, #1d1509, #0a0a0a 75%)",
};

const shortcuts = [
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/benefits", label: "Benefits", icon: Gift },
  { href: "/#gallery", label: "Gallery", icon: Images },
  { href: "/#contact", label: "Contact", icon: MessageCircle },
];

function NextRide() {
  const { event, location, loading } = useNextRide();
  if (loading) return <div className="h-44 animate-pulse rounded-3xl bg-muted" />;
  if (!event) return null;
  const days = daysUntil(event.date);

  return (
    <Link
      href="/dashboard/events"
      className="relative flex min-h-44 items-end overflow-hidden rounded-[22px_22px_6px_22px] text-white"
    >
      {event.image_link ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.image_link} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={ART} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <span className="absolute top-3.5 left-4 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
        Next ride · {relativeDays(days)}
      </span>
      <div className="relative flex w-full items-center gap-3.5 p-4">
        <DateBlock date={event.date} className="h-14 w-[50px]" />
        <div className="min-w-0">
          <h3 className="font-heading text-lg leading-tight font-bold tracking-wide uppercase">
            {event.title}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatDate(event.date)}
            </span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {location}
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

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
  const news = useApiData(useCallback(() => api.getAnnouncements(), []), []);
  const latestNews = (news.data ?? []).slice(0, 4);

  const p = profile.data;
  const expiry = p?.membershipExpiresAt ?? null;
  const days = expiry ? daysUntil(expiry) : null;
  const expired = p?.status === "EXPIRED";
  const dueSoon = !expired && days !== null && days <= RENEWAL_WINDOW_DAYS;
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-5">
      <DashHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Your membership and what's coming up at the club."
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
          <Link href="/dashboard/card" aria-label="Open my card" className="block">
            <MemberIdCard profile={p} memberId={memberId} />
          </Link>
        </>
      )}

      <NextRide />

      <ul className="grid grid-cols-4 gap-2.5">
        {shortcuts.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card px-1 py-3 text-xs font-semibold shadow-xs ring-1 ring-border transition hover:ring-foreground/25"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <Panel>
        <PanelHeader
          title="Announcements"
          action={
            <Link href="/#announcements" className="text-xs font-medium text-primary hover:underline">
              See all
            </Link>
          }
        />
        {news.loading && <ListSkeleton rows={2} />}
        {!news.loading && latestNews.length === 0 && (
          <EmptyState icon={Megaphone} title="Nothing new" description="Club announcements will appear here." />
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
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(a.last_updated_at)}</p>
            </div>
          ))}
        </PanelList>
      </Panel>
    </div>
  );
}
