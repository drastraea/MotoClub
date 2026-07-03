"use client";

import { useCallback } from "react";
import { EventCard } from "@/components/cards/EventCard";
import { EventsCalendar } from "@/components/shared/EventsCalendar";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function DashboardEventsPage() {
  const { data: events, loading, error } = useApiData(
    useCallback(() => api.getEvents(), []),
    []
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Upcoming Events
      </h1>

      <div className="mt-8">
        <EventsCalendar />
      </div>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading events…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events?.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            href={`/dashboard/events/${event.id}`}
          />
        ))}
      </div>
      {events && events.length === 0 && !loading && (
        <p className="mt-8 text-sm text-muted-foreground">No upcoming events.</p>
      )}
    </div>
  );
}
