import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

const valueProps = ["Ride together every weekend", "Family that has your back"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-primary/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            Est. Brotherhood of Riders
          </span>
          <h1 className="font-heading max-w-xl text-5xl leading-none font-bold tracking-wide uppercase sm:text-6xl">
            Ride Together.
            <br />
            Stay <span className="text-primary">Family</span>.
          </h1>
          <div className="h-1 w-24 bg-primary" />
          <p className="max-w-xl text-lg text-muted-foreground">
            A community of riders sharing the road, the events, and the
            brotherhood. Join the club and be part of every ride.
          </p>
          <ul className="flex flex-col gap-2 self-stretch border-t border-border pt-4 text-left">
            {valueProps.map((item, i) => (
              <li key={item} className="font-heading font-semibold tracking-wide uppercase">
                <span className="text-primary">0{i + 1}.</span> {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} render={<Link href="/join" />}>
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/#events" />}
            >
              View Events
            </Button>
          </div>
        </div>

        <ImagePlaceholder className="aspect-square w-full lg:aspect-[4/5]" />
      </div>

      <Link
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 hidden h-8 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-muted-foreground/50 sm:flex"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-primary" />
      </Link>
    </section>
  );
}
