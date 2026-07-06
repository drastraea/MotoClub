"use client";

import { useCallback } from "react";
import { EventCardWithStub } from "@/components/cards/EventCardWithStub";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { mockEvents } from "@/lib/mock-events";

// Fallback preview shown to logged-out visitors, since GET /events currently
// requires a member+ session. Real events replace this once loaded.
export function EventsSection() {
  const { data } = useApiData(useCallback(() => api.getEvents(), []), []);
  const events =
    data && data.length > 0
      ? data.map((e) => ({ id: e.id, title: e.title, date: e.date, location: undefined }))
      : mockEvents.map((e) => ({ id: e.id, title: e.title, date: e.dateLabel, location: e.location }));

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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCardWithStub key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}
