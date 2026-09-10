"use client";

import { toast } from "sonner";
import { Play } from "lucide-react";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";
import { siteIconMap } from "@/lib/site-icons";

export function BenefitsSection({
  data = defaultSiteContent.benefits,
}: {
  data?: SiteContent["benefits"];
}) {
  return (
    <section id="benefits" className="scroll-mt-24 border-y border-border bg-secondary/20 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            {data.heading}
          </h2>
          <div className="mt-3 h-1 w-16 bg-primary" />

          <div className="mt-6 flex flex-col gap-6">
            {data.items.map(({ id, icon, title, description }) => {
              const Icon = siteIconMap[icon];
              return (
                <div key={id} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="shape-corner-sm flex size-12 shrink-0 items-center justify-center bg-primary/10 ring-1 ring-primary/30">
                    {Icon && <Icon className="size-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold tracking-wide uppercase">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <ImagePlaceholder className="aspect-video w-full" />
          <button
            type="button"
            aria-label="Play club highlight video"
            onClick={() => toast.info("Video coming soon")}
            className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Play className="size-6 fill-current" />
          </button>
        </div>
      </div>
    </section>
  );
}
