import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
        Ride Together. Stay Family.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        A community of riders sharing the road, the events, and the brotherhood.
        Join the club and be part of every ride.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" render={<Link href="/join" />}>
          Join Now
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/events" />}>
          View Events
        </Button>
      </div>
    </section>
  );
}
