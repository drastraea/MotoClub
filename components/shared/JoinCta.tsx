import Link from "next/link";
import { Button } from "@/components/ui/button";

export function JoinCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold tracking-tight">Ready to Ride With Us?</h2>
        <p className="max-w-md text-primary-foreground/80">
          Apply for membership today and join the next chapter of our club.
        </p>
        <Button size="lg" variant="secondary" render={<Link href="/join" />}>
          Join Now
        </Button>
      </div>
    </section>
  );
}
