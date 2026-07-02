import type { Metadata } from "next";
import { JoinForm } from "@/components/shared/JoinForm";

export const metadata: Metadata = {
  title: "Join Now - Motorcycle Club",
};

export default function JoinPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Join the Club</h1>
      <p className="mt-2 text-muted-foreground">
        Fill out the application below. Membership is confirmed after admin
        review.
      </p>

      <div className="mt-10">
        <JoinForm />
      </div>
    </section>
  );
}
