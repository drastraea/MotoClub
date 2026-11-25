import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";

export function JoinCta({
  data = defaultSiteContent.join_cta,
}: {
  data?: SiteContent["join_cta"];
}) {
  return (
    <LoggedOutOnly>
      <section className="relative overflow-hidden bg-primary px-4 py-20 text-center text-primary-foreground">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 60px, rgba(0,0,0,.05) 60px 62px)",
          }}
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4">
          <h2 className="font-heading text-[clamp(2.5rem,7vw,5.25rem)] leading-none font-bold tracking-wide uppercase">
            {data.heading}
          </h2>
          <p className="max-w-md text-lg text-primary-foreground/85">{data.body}</p>
          <Button
            size="lg"
            className="mt-2 h-12 bg-neutral-950 px-8 text-base text-white hover:bg-neutral-800"
            nativeButton={false}
            render={<Link href="/join" />}
          >
            Join now
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </LoggedOutOnly>
  );
}
