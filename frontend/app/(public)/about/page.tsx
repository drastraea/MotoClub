import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "About - Motorcycle Club",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <PageHeader
        title="About the Club"
        description="Founded by riders for riders, our club brings together people who share a passion for the open road. From weekend rides to charity runs, we build lasting friendships one mile at a time."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-wide uppercase">
            Our Mission
          </h2>
          <p className="mt-2 text-muted-foreground">
            To support our members, give back to the community, and keep the
            spirit of riding alive across generations.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-wide uppercase">
            Our Values
          </h2>
          <p className="mt-2 text-muted-foreground">
            Brotherhood, safety, respect for the road, and giving back to the
            communities we ride through.
          </p>
        </div>
      </div>
    </section>
  );
}
