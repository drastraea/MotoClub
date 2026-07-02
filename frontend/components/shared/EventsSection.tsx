import { EventCard } from "@/components/cards/EventCard";
import { mockEvents } from "@/lib/mock-events";

export function EventsSection() {
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
          {mockEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.dateLabel}
              location={event.location}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
