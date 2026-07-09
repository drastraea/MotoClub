import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";

export function JoinCta() {
  return (
    <LoggedOutOnly>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 border-2 border-primary bg-primary px-6 py-16 text-center text-primary-foreground">
        <h2 className="font-heading text-4xl font-bold tracking-wide uppercase">
          Ready to Ride With Us?
        </h2>
        <p className="max-w-md text-primary-foreground/80">
          Apply for membership today and join the next chapter of our club.
        </p>
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
