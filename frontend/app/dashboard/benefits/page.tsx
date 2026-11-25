"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { QrCode } from "@/components/shared/QrCode";
import { useOrigin } from "@/hooks/useOrigin";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteIconMap } from "@/lib/site-icons";

export default function MemberBenefitsPage() {
  const origin = useOrigin();
  const { content } = useSiteContent();

  return (
    <div className="flex flex-col gap-5">
      <DashHeader title="Benefits" description="What your membership includes." />

      <div className="relative overflow-hidden rounded-[24px_24px_6px_24px] border border-white/10 bg-neutral-950 p-5 text-neutral-50">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative flex items-center gap-5">
          <div className="shrink-0 rounded-xl bg-white p-2">
            <QrCode value={`${origin}/#benefits`} size={104} />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl leading-tight font-bold tracking-wide uppercase">
              Your card is your pass
            </h2>
            <p className="mt-1.5 text-sm text-neutral-400">
              Show your card at events and partner shops to use your benefits.
            </p>
            <Link
              href="/dashboard/card"
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              Show my card
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <h2 className="px-1 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
        What you get
      </h2>
      <ul className="flex flex-col gap-3">
        {content.benefits.items.map((b) => {
          const Icon = siteIconMap[b.icon];
          return (
            <li key={b.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-xs ring-1 ring-border">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                {Icon && <Icon className="size-6" />}
              </span>
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
