"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileDetails } from "@/components/shared/ProfileDetails";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { statusMeta } from "@/lib/member-status";

const PENDING = "PENDING_APPROVAL";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const from = useSearchParams().get("from");
  const backHref = from === "applications" ? "/admin/members" : "/admin/users";
  const [busy, setBusy] = useState(false);

  const { data: profile, loading, error, reload } = useApiData(
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

  const extend = async () => {
    setBusy(true);
    try {
      await api.extendMembership(id);
      toast.success("Membership extended by 3 years");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extend failed");
    } finally {
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
        {profile && (
          <Badge variant={statusMeta(profile.status).badge}>
            {statusMeta(profile.status).label}
          </Badge>
        )}
      </div>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

      {profile && (
        <>
          <ProfileDetails profile={profile} memberId={id} />

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

          {(profile.status === "APPROVED" || profile.status === "EXPIRED") && (
            <div className="mt-8 flex justify-end">
              <Button variant="outline" disabled={busy} onClick={extend}>
                <CalendarPlus className="size-4" />
                Extend Membership (+3 years)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
