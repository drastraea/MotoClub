"use client";

import { useCallback, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateBlock } from "@/components/shared/DateBlock";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { formatDate, todayISO } from "@/lib/dash-utils";

const ART = {
  background:
    "radial-gradient(60% 60% at 70% 30%, rgba(245,158,11,.30), transparent 62%), repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,.04) 38px 40px), linear-gradient(160deg, #1d1509, #0a0a0a 75%)",
};

// GET /events is public: anonymous visitors see events flagged public; signed-in
// members see all. Empty gets a quiet note rather than fake events.
export function EventsSection() {
  const { data } = useApiData(useCallback(() => api.getEvents(), []), []);

  const upcoming = useMemo(() => {
    const today = todayISO();
    return (data ?? [])
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [data]);

  return (
    <section id="events" className="scroll-mt-24 border-y border-border bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            Ride Calendar
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            Upcoming Events
          </h2>
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <article
                key={event.id}
                className="flex flex-col overflow-hidden rounded-[20px_20px_5px_20px] border border-border bg-card"
              >
                {event.image_link ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_link}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full" style={ART} />
                )}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <DateBlock date={event.date} />
                    <h3 className="font-heading text-lg leading-tight font-bold tracking-wide uppercase">
                      {event.title}
                    </h3>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {formatDate(event.date)}
                    </span>
                    <Badge variant="secondary">{event.is_public ? "Open to all" : "Members only"}</Badge>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            No upcoming rides posted yet. Sign in as a member to see the full calendar.
          </p>
        )}
      </div>
    </section>
  );
}
