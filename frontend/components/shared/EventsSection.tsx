import { EventCard } from "@/components/cards/EventCard";

// TODO: Replace with GET /events?startFrom= (see api_contract.json)
const events = [
  { id: "1", title: "Sunday Morning Ride", date: "Jul 6, 2026 - 7:00 AM", location: "Club HQ" },
  { id: "2", title: "Charity Run for Local Shelter", date: "Jul 19, 2026 - 9:00 AM", location: "City Park" },
  { id: "3", title: "Annual Members Meetup", date: "Aug 2, 2026 - 5:00 PM", location: "Riverside Grounds" },
  { id: "4", title: "Night Ride & Bonfire", date: "Aug 15, 2026 - 6:00 PM", location: "Lakeside Camp" },
  { id: "5", title: "Club Anniversary Gathering", date: "Sep 5, 2026 - 4:00 PM", location: "Club HQ" },
];

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
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}
