"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusSchema = z.object({
  email: z.email("Enter a valid email"),
});

type StatusValues = z.infer<typeof statusSchema>;

type Status = "pending" | "approved" | "rejected" | "not-found";

// TODO: Replace with a real public status-lookup endpoint once one
// exists. api_contract.json only has admin-only registration lookups
// (GET /members/registration) today.
const mockStatuses: Record<string, Exclude<Status, "not-found">> = {
  "alex.rider@example.com": "approved",
  "pending.applicant@example.com": "pending",
  "rejected.applicant@example.com": "rejected",
};

const statusCopy: Record<Status, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending Review", icon: Clock, className: "text-primary" },
  approved: { label: "Approved", icon: CheckCircle2, className: "text-primary" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive" },
  "not-found": { label: "No application found for this email", icon: Search, className: "text-muted-foreground" },
};

export function MembershipStatusForm() {
  const [result, setResult] = useState<Status | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StatusValues>({ resolver: zodResolver(statusSchema) });

  const onSubmit = async (values: StatusValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setResult(mockStatuses[values.email.toLowerCase()] ?? "not-found");
  };

  const Result = result ? statusCopy[result] : null;

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email used on your application</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Checking..." : "Check Status"}
        </Button>
      </form>

      {Result && (
        <div role="status" className={`flex items-center gap-3 ${Result.className}`}>
          <Result.icon className="size-5" />
          <span className="font-medium">{Result.label}</span>
        </div>
      )}
    </div>
  );
}
