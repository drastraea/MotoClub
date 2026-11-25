"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, User, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel } from "@/components/dashboard/Panel";
import { api, type Profile } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { refreshPendingCount } from "@/hooks/usePendingCount";
import { formatDate, initials } from "@/lib/dash-utils";

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold">{value || "—"}</dd>
    </div>
  );
}

// One applicant at a time: read the details, then approve or reject. On a phone the
// decision buttons stay pinned above the tab bar so they are always one thumb away.
export default function AdminApplicationsPage() {
  const { data: registrations, loading, error, reload } = useApiData(
    useCallback(() => api.getRegistrations(), []),
    []
  );
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const total = registrations?.length ?? 0;
  const current = registrations?.[Math.min(index, Math.max(total - 1, 0))];
  const profile = current ? profiles[current.member_id] : undefined;
  const currentId = current?.member_id;

  useEffect(() => {
    if (!currentId || profiles[currentId]) return;
    let live = true;
    api
      .getProfile(currentId)
      .then((p) => live && setProfiles((all) => ({ ...all, [currentId]: p })))
      .catch(() => {}); // the card still works from the list data alone
    return () => {
      live = false;
    };
  }, [currentId, profiles]);

  const decide = async (action: "APPROVE" | "REJECT") => {
    if (!current) return;
    if (action === "REJECT" && !window.confirm(`Reject ${current.name}'s application?`)) return;
    setBusy(true);
    try {
      await api.setMemberStatus(current.member_id, action);
      toast.success(action === "APPROVE" ? "Application approved" : "Application rejected");
      await reload();
      void refreshPendingCount();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const bike = profile ? [profile.motorbikeBrand, profile.motorbikeType].filter(Boolean).join(" ") : "";
  const pos = Math.min(index, Math.max(total - 1, 0));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <DashHeader
        title="Applications"
        description={
          registrations
            ? `${total} pending application${total === 1 ? "" : "s"}`
            : "Review new membership applications."
        }
      />

      {loading && <ListSkeleton />}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {registrations && total === 0 && (
        <Panel>
          <EmptyState
            icon={CheckCircle2}
            title="No pending applications"
            description="New membership applications will appear here for review."
          />
        </Panel>
      )}

      {current && (
        <>
          <div className="flex items-center justify-between">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Previous application"
              disabled={pos === 0}
              onClick={() => setIndex(pos - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {pos + 1} of {total}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Next application"
              disabled={pos >= total - 1}
              onClick={() => setIndex(pos + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-border">
            <div className="flex items-center gap-4">
              {profile?.riderPhotoLinkPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.riderPhotoLinkPath} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
                  {initials(current.name)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-heading truncate text-2xl leading-tight font-bold tracking-wide uppercase">
                  {current.name}
                </h2>
                <p className="truncate text-xs text-muted-foreground">{current.email}</p>
                <p className="text-xs text-muted-foreground">Applied {formatDate(current.registered_at)}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Fact label="Phone" value={profile?.phoneNumber} />
              <Fact label="Instagram" value={profile?.instagramUsername} />
              <Fact label="Bike" value={bike} />
              <Fact label="Plate" value={profile?.plateNumber} />
            </dl>

            {profile?.motorbikeSelfieLinkPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.motorbikeSelfieLinkPath}
                alt="Rider with motorbike"
                className="aspect-video w-full rounded-xl object-cover"
              />
            )}

            <Button
              variant="ghost"
              className="self-start"
              nativeButton={false}
              render={<Link href={`/admin/members/${current.member_id}?from=applications`} />}
            >
              <User className="size-4" />
              Full profile
            </Button>
          </div>

          <div className="sticky bottom-24 z-10 grid grid-cols-2 gap-3 lg:static">
            <Button variant="outline" size="lg" className="h-12 bg-background" disabled={busy} onClick={() => decide("REJECT")}>
              <X className="size-4" />
              Reject
            </Button>
            <Button size="lg" className="h-12" disabled={busy} onClick={() => decide("APPROVE")}>
              <Check className="size-4" />
              Approve
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
