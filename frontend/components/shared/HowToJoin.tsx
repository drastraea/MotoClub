import Link from "next/link";
import { ArrowRight, Clock, IdCard, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";

const stepIcons = [UserRound, IdCard, ShieldCheck];

// Only useful to people who are not members yet, so signed-in members never see it.
export function HowToJoin({
  data = defaultSiteContent.how_to_join,
}: {
  data?: SiteContent["how_to_join"];
}) {
  return (
    <LoggedOutOnly>
      <section id="join" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            {data.heading}
          </h2>
          <p className="text-muted-foreground">{data.intro}</p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {data.steps.map((step, i) => {
            const Icon = stepIcons[i % stepIcons.length];
            return (
              <li
                key={i}
                className="relative overflow-hidden rounded-[26px_26px_6px_26px] border border-border bg-card p-7"
              >
                <div className="absolute top-5 right-5 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <span
                  className="font-heading text-[5.25rem] leading-[.8] font-bold text-transparent"
                  style={{ WebkitTextStroke: "1.5px var(--primary)" }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h3 className="font-heading mt-5 mb-2 text-xl font-bold tracking-wide uppercase">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>

        {data.note && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {data.note}
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <Button size="lg" className="h-12 px-8 text-base" nativeButton={false} render={<Link href="/join" />}>
            Start your application
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </LoggedOutOnly>
  );
}
