"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateBlock } from "@/components/shared/DateBlock";
import { EventDialog } from "@/components/shared/EventDialog";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { api, type EventSummary } from "@/lib/api";
import { googleCalendarUrl } from "@/lib/calendar";
import { daysUntil, formatEventDate, relativeDays, todayISO } from "@/lib/dash-utils";
import { useApiData } from "@/hooks/useApiData";
import { useEventLocations } from "@/hooks/useEventLocations";
import { cn } from "@/lib/utils";

const ART = {
  background:
    "radial-gradient(60% 60% at 70% 30%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 62%), repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,.04) 38px 40px), linear-gradient(160deg, #17181a, #0a0a0a 75%)",
};

function monthLabel(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

async function shareEvent(event: EventSummary) {
  const url = `${window.location.origin}/#events`;
  const text = `${event.title}, ${formatEventDate(event.date, event.time)}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: event.title, text, url });
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copied");
    }
  } catch {
    // Share sheet dismissed: nothing to report.
  }
}

function EventCard({
  event,
  location,
  featured,
  past,
  onOpen,
}: {
  event: EventSummary;
  location: string | null | undefined;
  featured: boolean;
  past: boolean;
  onOpen: () => void;
}) {
  const days = daysUntil(event.date);
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card shadow-xs ring-1 ring-border transition hover:ring-foreground/25",
        past && "opacity-75"
      )}
    >
      {featured && (
        <div className="relative h-36 sm:h-44">
          {event.image_link ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image_link} alt="" className="size-full object-cover" />
          ) : (
            <div className="on-dark size-full" style={ART} />
          )}
          <span className="on-dark absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase">
            Next ride
          </span>
        </div>
      )}
      <div className="flex gap-4 p-4">
        <DateBlock date={event.date} tone={featured ? "accent" : "muted"} />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg leading-tight font-bold tracking-wide uppercase">
            <button type="button" onClick={onOpen} className="text-left uppercase after:absolute after:inset-0">
              {event.title}
            </button>
          </h3>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" />
              <span>
                {formatEventDate(event.date, event.time)}
                {!past && <span className="text-foreground/70"> · {relativeDays(days)}</span>}
              </span>
            </span>
            {location && (
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {location}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{event.is_public ? "Open to all" : "Members only"}</Badge>
            {!past && (
              <span className="relative z-10 ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant={featured ? "default" : "outline"}
                  nativeButton={false}
                  render={
                    <a
                      href={googleCalendarUrl(event.title, event.date, location, event.time)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <CalendarPlus className="size-4" />
                  Add to calendar
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`Share ${event.title}`}
                  onClick={() => void shareEvent(event)}
                >
                  <Share2 className="size-4" />
                </Button>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MemberEventsPage() {
  const { data, loading, error } = useApiData(useCallback(() => api.getEvents(), []), []);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [openId, setOpenId] = useState<string | null>(null);

  const { upcoming, past } = useMemo(() => {
    const today = todayISO();
    const all = data ?? [];
    return {
      upcoming: all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
      past: all.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [data]);

  const list = tab === "upcoming" ? upcoming : past;
  const locations = useEventLocations(list.slice(0, 12).map((e) => e.id));

  const groups = useMemo(() => {
    const out: { label: string; items: EventSummary[] }[] = [];
    for (const e of list) {
      const label = monthLabel(e.date);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [list]);

  return (
    <div className="flex flex-col gap-5">
      <DashHeader title="Events" description="Rides, meetups and gatherings." />

      <div className="grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Events">
        {(
          [
            ["upcoming", `Upcoming${upcoming.length ? ` (${upcoming.length})` : ""}`],
            ["past", "Past"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold text-muted-foreground transition",
              tab === id && "bg-card text-foreground shadow-xs"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <ListSkeleton rows={3} />}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && list.length === 0 && (
        <div className="rounded-2xl bg-card ring-1 ring-border">
          <EmptyState
            icon={CalendarDays}
            title={tab === "upcoming" ? "No upcoming events" : "No past events"}
            description={
              tab === "upcoming" ? "New rides and meetups will show up here." : "Events that have happened appear here."
            }
          />
        </div>
      )}

      {groups.map((g) => (
        <section key={g.label} className="flex flex-col gap-3">
          <h2 className="px-1 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {g.label}
          </h2>
          {g.items.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              location={locations[e.id]}
              featured={tab === "upcoming" && e.id === upcoming[0]?.id}
              past={tab === "past"}
              onOpen={() => setOpenId(e.id)}
            />
          ))}
        </section>
      ))}

      <EventDialog id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
