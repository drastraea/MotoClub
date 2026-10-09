"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel, PanelList } from "@/components/dashboard/Panel";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { formatDate, initials } from "@/lib/dash-utils";

export default function AdminMembersPage() {
  const { data: registrations, loading, error, reload } = useApiData(
    useCallback(() => api.getRegistrations(), []),
    []
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const count = registrations?.length ?? 0;

  const decide = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !window.confirm("Reject this application?")) return;
    setBusyId(id);
    try {
      await api.setMemberStatus(id, action);
      toast.success(action === "APPROVE" ? "Application approved" : "Application rejected");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title="Applications"
        description={
          registrations
            ? `${count} pending application${count === 1 ? "" : "s"}`
            : "Review new membership applications."
        }
      />

      <Panel>
        {loading && <ListSkeleton />}
        {error && <p className="px-5 py-4 text-sm text-destructive">{error}</p>}
        {registrations && count === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="No pending applications"
            description="New membership applications will appear here for review."
          />
        )}
        <PanelList>
          {registrations?.map((r) => (
            <div
              key={r.member_id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4"
            >
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials(r.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.email} · submitted {formatDate(r.registered_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === r.member_id}
                  onClick={() => decide(r.member_id, "REJECT")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={busyId === r.member_id}
                  onClick={() => decide(r.member_id, "APPROVE")}
                >
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href={`/admin/members/${r.member_id}?from=applications`} />}
                >
                  View
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </PanelList>
      </Panel>
    </div>
  );
}
