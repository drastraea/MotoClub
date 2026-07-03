import { EventCard } from "@/components/cards/EventCard";
import { EventsCalendar } from "@/components/shared/EventsCalendar";
import { mockEvents } from "@/lib/mock-events";

export default function DashboardEventsPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Upcoming Events
      </h1>

      <div className="mt-8">
        <EventsCalendar />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.dateLabel}
            location={event.location}
            href={`/dashboard/events/${event.id}`}
          />
        ))}
      </div>
    </div>
  );
}
