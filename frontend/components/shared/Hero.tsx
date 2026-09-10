import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";
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

export function Hero({ data = defaultSiteContent.hero }: { data?: SiteContent["hero"] }) {
  return (
    <section className="relative overflow-hidden border-b-2 border-primary/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h1 className="font-heading max-w-xl text-5xl leading-none font-bold tracking-wide uppercase sm:text-6xl">
            {data.headline_lines.map((line, i) => (
              <span key={i}>
                {withHighlight(line, data.highlight)}
                {i < data.headline_lines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <div className="h-1 w-24 bg-primary" />
          <p className="max-w-xl text-lg text-muted-foreground">{data.body}</p>
          {data.value_props.length > 0 && (
            <ul className="flex flex-col gap-2 self-stretch border-t border-border pt-4 text-left">
              {data.value_props.map((item, i) => (
                <li key={item} className="font-heading font-semibold tracking-wide uppercase">
                  <span className="text-primary">0{i + 1}.</span> {item}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <LoggedOutOnly>
              <Button size="lg" nativeButton={false} render={<Link href="/join" />}>
                Join Now
              </Button>
            </LoggedOutOnly>
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

        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image}
            alt=""
            className="img-mono shape-corner aspect-square w-full border border-border object-cover shadow-inner lg:aspect-[4/5]"
          />
        ) : (
          <ImagePlaceholder className="aspect-square w-full lg:aspect-[4/5]" />
        )}
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
