"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { statusMeta } from "@/lib/member-status";

export function MyMembershipStatus({ memberId }: { memberId: string }) {
  const { data: profile, loading, error } = useApiData(
    useCallback(() => api.getProfile(memberId), [memberId]),
    [memberId]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Checking your status…</p>;
  if (error || !profile) {
    return <p className="text-sm text-destructive">{error ?? "Could not load your status."}</p>;
  }

  const meta = statusMeta(profile.status);
  const expired = profile.status === "EXPIRED";

  return (
    <div className="flex flex-col gap-1">
      <div role="status" className={`flex items-center gap-3 ${meta.className}`}>
        <meta.icon className="size-5" />
        <span className="font-medium">{meta.label}</span>
      </div>
      {profile.membershipExpiresAt && (
        <p className="text-sm text-muted-foreground">
          {expired ? "Expired on " : "Valid until "}
          {profile.membershipExpiresAt}
          {expired && " — contact an admin to renew."}
        </p>
      )}
    </div>
  );
}
