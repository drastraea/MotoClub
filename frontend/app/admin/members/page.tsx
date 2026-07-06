"use client";

import { useCallback, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function AdminMembersPage() {
  const { data: registrations, loading, error, reload } = useApiData(
    useCallback(() => api.getRegistrations(), []),
    []
  );
  const [busy, setBusy] = useState<string | null>(null);

  const respond = async (id: string, name: string, action: "APPROVE" | "REJECT") => {
    setBusy(id);
    try {
      await api.setMemberStatus(id, action);
      toast.success(action === "APPROVE" ? `${name} approved` : `${name} rejected`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const count = registrations?.length ?? 0;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Membership Approval
      </h1>
      {loading && <p className="mt-2 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {registrations && (
        <p className="mt-2 text-muted-foreground">
          {count} pending application{count === 1 ? "" : "s"}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {registrations && count === 0 && (
          <p className="text-sm text-muted-foreground">No pending applications.</p>
        )}
        {registrations?.map((r) => (
          <Card key={r.member_id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{r.name}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span>{r.email}</span>
                  <span>Submitted {r.registered_at}</span>
                </CardDescription>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Button
                  size="sm"
                  disabled={busy === r.member_id}
                  onClick={() => respond(r.member_id, r.name, "APPROVE")}
                >
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === r.member_id}
                  onClick={() => respond(r.member_id, r.name, "REJECT")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
