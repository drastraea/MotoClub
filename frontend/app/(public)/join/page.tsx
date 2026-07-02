import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/shared/JoinForm";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Join Now - Motorcycle Club",
};

export default function JoinPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader
        title="Join the Club"
        description="Fill out the application below. Membership is confirmed after admin review."
      />

      <div className="mt-10">
        <JoinForm />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Already applied?{" "}
        <Link href="/status" className="font-medium text-primary hover:underline">
          Check your membership status
        </Link>
        .
      </p>
    </section>
  );
}
