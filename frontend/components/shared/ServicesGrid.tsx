import { defaultSiteContent, type SiteContent } from "@/lib/site-content";
import { siteIconMap } from "@/lib/site-icons";

export function ServicesGrid({
  data = defaultSiteContent.activities,
}: {
  data?: SiteContent["activities"];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          {data.eyebrow}
        </span>
        <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
          {data.heading}
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {data.items.map(({ icon, title }) => {
          const Icon = siteIconMap[icon];
          return (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="shape-corner flex size-16 items-center justify-center bg-primary">
                {Icon && <Icon className="size-7 text-primary-foreground" />}
              </div>
              <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">
                {title}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}
