"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MembershipStatusForm } from "@/components/shared/MembershipStatusForm";
import { MyMembershipStatus } from "@/components/shared/MyMembershipStatus";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function StatusPage() {
  const { user, ready } = useAuth();

  return (
    <section className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <PageHeader
        title="Membership Status"
        description={
          user
            ? "Here's the current status of your membership application."
            : "Enter the email you used on your membership application to check its status."
        }
      />
      <div className="mt-10">
        {!ready ? null : user ? (
          <MyMembershipStatus memberId={user.id} />
        ) : (
          <MembershipStatusForm />
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-8"
        nativeButton={false}
        render={<Link href="/" />}
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Button>
    </section>
  );
}
