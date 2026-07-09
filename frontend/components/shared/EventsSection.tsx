"use client";

import { useCallback } from "react";
import { EventCard } from "@/components/cards/EventCard";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

// GET /events is public: anonymous visitors see events flagged public; logged-in
// members see all. Empty → a subtle prompt rather than fake events.
export function EventsSection() {
  const { data } = useApiData(useCallback(() => api.getEvents(), []), []);
  const events = data ?? [];

  return (
    <section id="events" className="scroll-mt-24 border-y border-border bg-secondary/20 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            Ride Calendar
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            Upcoming Events
          </h2>
        </div>
        {events.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                date={event.date}
                imageLink={event.image_link ?? undefined}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No upcoming rides posted yet — sign in as a member to see the full calendar.
          </p>
        )}
      </div>
    </section>
  );
}
