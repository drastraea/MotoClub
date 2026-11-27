"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateBlock } from "@/components/shared/DateBlock";
import { EventDialog } from "@/components/shared/EventDialog";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";
import { useNextRide } from "@/hooks/useNextRide";
import { daysUntil, formatDate, relativeDays } from "@/lib/dash-utils";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";

// Splits a headline line around the highlighted word so it keeps the accent
// colour without needing markup in the stored string.
function withHighlight(line: string, highlight: string) {
  if (!highlight) return line;
  const idx = line.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return line;
  return (
    <>
      {line.slice(0, idx)}
      <span className="text-primary">{line.slice(idx, idx + highlight.length)}</span>
      {line.slice(idx + highlight.length)}
    </>
  );
}

// Dark artwork shown until the admin uploads a banner photo.
const ART = {
  background:
    "radial-gradient(90% 70% at 85% 25%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 60%), radial-gradient(60% 50% at 10% 100%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 60%), repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,.035) 38px 40px), linear-gradient(160deg, #151619, #0a0a0a 70%)",
};

function NextRideCard() {
  const { event, location } = useNextRide();
  const [open, setOpen] = useState(false);
  if (!event) return null;
  const days = daysUntil(event.date);

  return (
    <div className="relative flex flex-col gap-4 rounded-[26px_26px_6px_26px] border border-white/15 bg-neutral-900/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
          Next ride
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-neutral-300">
          {relativeDays(days)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <DateBlock date={event.date} className="h-[66px] w-[62px]" />
        <h3 className="font-heading text-xl leading-tight font-bold tracking-wide uppercase">
          <button type="button" onClick={() => setOpen(true)} className="text-left uppercase after:absolute after:inset-0">
            {event.title}
          </button>
        </h3>
      </div>
      <div className="flex flex-col gap-1 text-sm text-neutral-400">
        <span className="flex items-center gap-2">
          <Clock className="size-3.5" />
          {formatDate(event.date)}
        </span>
        {location && (
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5" />
            {location}
          </span>
        )}
      </div>
      <Link
        href="/#events"
        className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold"
      >
        <span>All upcoming events</span>
        <ArrowRight className="size-4 text-primary" />
      </Link>
      <EventDialog id={open ? event.id : null} onClose={() => setOpen(false)} />
    </div>
  );
}

export function Hero({ data = defaultSiteContent.hero }: { data?: SiteContent["hero"] }) {
  return (
    <section className="on-dark relative isolate flex min-h-[min(92vh,860px)] items-end overflow-hidden bg-neutral-950 text-neutral-50">
      {data.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 -z-20" style={ART} />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20 lg:bg-[linear-gradient(90deg,rgba(10,10,10,.92),rgba(10,10,10,.5)_52%,rgba(10,10,10,.1)),linear-gradient(0deg,rgba(10,10,10,.95),transparent_45%)]" />

      <div className="mx-auto grid w-full max-w-6xl items-end gap-10 px-4 pt-28 pb-14 sm:px-6 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h1 className="font-heading mt-4 text-[clamp(3rem,6.1vw,5.5rem)] leading-[.94] font-bold tracking-wide uppercase">
            {data.headline_lines.map((line, i) => (
              <span key={i} className="block">
                {withHighlight(line, data.highlight)}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-300">{data.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LoggedOutOnly>
              <Button size="lg" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/join" />}>
                Join the club
                <ArrowRight className="size-4" />
              </Button>
            </LoggedOutOnly>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-white/5 px-6 text-base text-white backdrop-blur hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/#events" />}
            >
              View events
            </Button>
          </div>
        </div>
        <NextRideCard />
      </div>
    </section>
  );
}
