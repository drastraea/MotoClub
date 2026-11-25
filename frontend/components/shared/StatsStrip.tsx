import type { SiteStat } from "@/lib/site-content";

// Big numbers under the banner. Renders nothing until the admin adds some, so
// the page never shows invented figures.
export function StatsStrip({ stats }: { stats: SiteStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="border-b border-border bg-muted/40">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-2 sm:px-6 ${
          stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""
        }`}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 border-l border-border px-5 py-7 first:border-l-0 max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t"
          >
            <span className="font-heading text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-bold text-primary">
              {s.value}
            </span>
            <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
