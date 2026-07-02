import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { MembershipStatusForm } from "@/components/shared/MembershipStatusForm";

export const metadata: Metadata = {
  title: "Membership Status - Motorcycle Club",
};

export default function StatusPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <PageHeader
        title="Membership Status"
        description="Enter the email you used on your membership application to check its status."
      />
      <div className="mt-10">
        <MembershipStatusForm />
      </div>
    </section>
  );
}
