"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileDetails } from "@/components/shared/ProfileDetails";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

const PENDING = "PENDING_APPROVAL";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const from = useSearchParams().get("from");
  const backHref = from === "applications" ? "/admin/members" : "/admin/users";
  const [busy, setBusy] = useState(false);

  const { data: profile, loading, error } = useApiData(
    useCallback(() => api.getProfile(id), [id]),
    [id]
  );

  const respond = async (action: "APPROVE" | "REJECT") => {
    setBusy(true);
    try {
      await api.setMemberStatus(id, action);
      toast.success(action === "APPROVE" ? "Application approved" : "Application rejected");
      router.push("/admin/members");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
      setBusy(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={backHref} />}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          {profile?.status === PENDING ? "Membership Application" : "Member Profile"}
        </h1>
        {profile && <Badge>{profile.status}</Badge>}
      </div>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

      {profile && (
        <>
          <ProfileDetails profile={profile} />

          {profile.status === PENDING && (
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" disabled={busy} onClick={() => respond("REJECT")}>
                <X className="size-4" />
                Reject
              </Button>
              <Button disabled={busy} onClick={() => respond("APPROVE")}>
                <Check className="size-4" />
                Approve
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
