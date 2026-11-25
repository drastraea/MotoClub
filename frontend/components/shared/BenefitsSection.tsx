import { IdCard } from "lucide-react";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";
import { siteIconMap } from "@/lib/site-icons";

// Same dark artwork as the hero, used when no benefits photo is uploaded.
const ART = {
  background:
    "radial-gradient(70% 55% at 75% 25%, rgba(245,158,11,.30), transparent 62%), repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,.04) 38px 40px), linear-gradient(160deg, #1d1509, #0a0a0a 75%)",
};

export function BenefitsSection({
  data = defaultSiteContent.benefits,
}: {
  data?: SiteContent["benefits"];
}) {
  return (
    <section
      id="benefits"
      className="scroll-mt-24 border-y border-border bg-muted/40 py-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            {data.heading}
          </h2>
          <div className="mt-3 h-1 w-16 bg-primary" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.items.map(({ id, icon, title, description }) => {
              const Icon = siteIconMap[icon];
              return (
                <div
                  key={id}
                  className="rounded-[20px_20px_5px_20px] border border-border bg-card p-5"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    {Icon && <Icon className="size-5" />}
                  </div>
                  <h3 className="font-heading mb-1.5 text-lg font-bold tracking-wide uppercase">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem_2.5rem_.5rem_2.5rem] border border-border bg-neutral-950">
          {data.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full" style={ART} />
          )}
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl border border-white/15 bg-neutral-950/70 p-4 text-neutral-50 backdrop-blur-xl">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IdCard className="size-6" />
            </span>
            <div>
              <p className="font-heading text-base font-bold tracking-wide uppercase">
                Your card is your pass
              </p>
              <p className="text-xs text-neutral-400">
                Every member gets a digital card with a QR code to use at events and partner shops.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
