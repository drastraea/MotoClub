"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { mockEvents } from "@/lib/mock-events";

export function EventsCalendar() {
  const router = useRouter();

  return (
    <div className="shape-corner border border-border bg-card p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={mockEvents.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.date,
        }))}
        eventClick={(info) => router.push(`/dashboard/events/${info.event.id}`)}
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
      />
    </div>
  );
}
