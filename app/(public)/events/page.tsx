import type { Metadata } from "next";
import { EventCard } from "@/components/cards/EventCard";

export const metadata: Metadata = {
  title: "Events - Motorcycle Club",
};

// TODO: Replace with GET /events?startFrom= (see api_contract.json)
const events = [
  { id: "1", title: "Sunday Morning Ride", date: "Jul 6, 2026 - 7:00 AM", location: "Club HQ" },
  { id: "2", title: "Charity Run for Local Shelter", date: "Jul 19, 2026 - 9:00 AM", location: "City Park" },
  { id: "3", title: "Annual Members Meetup", date: "Aug 2, 2026 - 5:00 PM", location: "Riverside Grounds" },
  { id: "4", title: "Night Ride & Bonfire", date: "Aug 15, 2026 - 6:00 PM", location: "Lakeside Camp" },
  { id: "5", title: "Club Anniversary Gathering", date: "Sep 5, 2026 - 4:00 PM", location: "Club HQ" },
];

export default function EventsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Events</h1>
      <p className="mt-2 text-muted-foreground">
        All upcoming rides and gatherings. Public events are open to everyone.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
}
