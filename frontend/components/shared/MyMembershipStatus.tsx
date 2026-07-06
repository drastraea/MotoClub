"use client";

import { useCallback } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

const statusCopy: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  PENDING_APPROVAL: { label: "Pending Review", icon: Clock, className: "text-primary" },
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "text-primary" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "text-destructive" },
};

export function MyMembershipStatus({ memberId }: { memberId: string }) {
  const { data: profile, loading, error } = useApiData(
    useCallback(() => api.getProfile(memberId), [memberId]),
    [memberId]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Checking your status…</p>;
  if (error || !profile) {
    return <p className="text-sm text-destructive">{error ?? "Could not load your status."}</p>;
  }

  const Result = statusCopy[profile.status] ?? {
    label: profile.status,
    icon: Clock,
    className: "text-muted-foreground",
  };

  return (
    <div role="status" className={`flex items-center gap-3 ${Result.className}`}>
      <Result.icon className="size-5" />
      <span className="font-medium">{Result.label}</span>
    </div>
  );
}
