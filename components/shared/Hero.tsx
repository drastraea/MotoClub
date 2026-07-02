import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-primary/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-28 text-center sm:px-6 sm:py-36">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          Est. Brotherhood of Riders
        </span>
        <h1 className="font-heading max-w-3xl text-5xl leading-none font-bold tracking-wide uppercase sm:text-7xl">
          Ride Together.
          <br />
          Stay <span className="text-primary">Family</span>.
        </h1>
        <div className="h-1 w-24 bg-primary" />
        <p className="max-w-xl text-lg text-muted-foreground">
          A community of riders sharing the road, the events, and the
          brotherhood. Join the club and be part of every ride.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/join" />}>
            Join Now
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/events" />}>
            View Events
          </Button>
        </div>
      </div>
    </section>
  );
}
