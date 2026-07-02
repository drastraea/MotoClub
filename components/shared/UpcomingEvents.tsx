import Link from "next/link";
import { EventCard } from "@/components/cards/EventCard";
import { Button } from "@/components/ui/button";

// TODO: Replace with GET /api/events?upcoming=true
const upcomingEvents = [
  { id: "1", title: "Sunday Morning Ride", date: "Jul 6, 2026 - 7:00 AM", location: "Club HQ" },
  { id: "2", title: "Charity Run for Local Shelter", date: "Jul 19, 2026 - 9:00 AM", location: "City Park" },
  { id: "3", title: "Annual Members Meetup", date: "Aug 2, 2026 - 5:00 PM", location: "Riverside Grounds" },
];

export function UpcomingEvents() {
  return (
    <section className="border-y border-border bg-secondary/20 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
              Ride Calendar
            </span>
            <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
              Upcoming Events
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/events" />}
          >
            View all
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}
