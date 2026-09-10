import Link from "next/link";
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
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 border-2 border-primary bg-primary px-6 py-16 text-center text-primary-foreground">
        <h2 className="font-heading text-4xl font-bold tracking-wide uppercase">
          {data.heading}
        </h2>
        <p className="max-w-md text-primary-foreground/80">{data.body}</p>
        <Button
          size="lg"
          variant="secondary"
          nativeButton={false}
          render={<Link href="/join" />}
        >
          Join Now
        </Button>
      </div>
      </section>
    </LoggedOutOnly>
  );
}
