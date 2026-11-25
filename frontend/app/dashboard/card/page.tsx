"use client";

import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/shared/QrCode";
import { api } from "@/lib/api";
import { downloadCardImage } from "@/lib/card-image";
import { daysUntil, formatDate, initials } from "@/lib/dash-utils";
import { statusMeta } from "@/lib/member-status";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import { useOrigin } from "@/hooks/useOrigin";
import { useWakeLock } from "@/hooks/useWakeLock";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  APPROVED: "#34d399",
  EXPIRED: "#f87171",
  REJECTED: "#f87171",
  PENDING_APPROVAL: "#fbbf24",
};

export default function MemberCardPage() {
  const { user } = useAuth();
  const memberId = user?.id;
  const origin = useOrigin();
  const [saving, setSaving] = useState(false);
  // Keep the screen on so the card does not dim while someone scans it.
  useWakeLock();

  const { data: p, loading, error } = useApiData(
    useCallback(() => {
      if (!memberId) return Promise.reject(new Error("Not signed in"));
      return api.getProfile(memberId);
    }, [memberId]),
    [memberId]
  );

  if (loading) return <div className="mx-auto h-[34rem] max-w-sm animate-pulse rounded-3xl bg-muted" />;
  if (error || !p || !memberId) {
    return <p className="text-sm text-destructive">{error ?? "Could not load your card."}</p>;
  }

  const meta = statusMeta(p.status);
  const expiry = p.membershipExpiresAt;
  const days = expiry ? daysUntil(expiry) : null;
  const bike = [p.motorbikeBrand, p.motorbikeType].filter(Boolean).join(" ");
  const qrValue = `${origin}/admin/members/${memberId}`;

  const save = async () => {
    setSaving(true);
    try {
      await downloadCardImage({
        name: p.name,
        memberId,
        plate: p.plateNumber,
        bike,
        statusLabel: meta.label,
        statusColor: statusColor[p.status] ?? "#a1a1aa",
        validUntil: expiry ? formatDate(expiry) : null,
        photoUrl: p.riderPhotoLinkPath || undefined,
        qrValue,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <div className="relative overflow-hidden rounded-[28px_28px_8px_28px] border border-white/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 text-neutral-50 shadow-[0_30px_60px_-24px_rgba(245,158,11,0.45)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative flex items-center gap-4">
          {p.riderPhotoLinkPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.riderPhotoLinkPath}
              alt=""
              className="size-16 shrink-0 rounded-2xl object-cover ring-2 ring-primary/70"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-lg font-bold text-primary ring-2 ring-primary/50">
              {initials(p.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.26em] text-primary uppercase">
              Brosqi.id member
            </p>
            <h1 className="font-heading truncate text-2xl leading-tight font-bold tracking-wide uppercase">
              {p.name}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              ID {memberId.padStart(5, "0")}
              {p.plateNumber && ` · ${p.plateNumber}`}
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-6 w-fit rounded-2xl bg-white p-3.5">
          <QrCode value={qrValue} size={216} />
        </div>

        {bike && <p className="relative mt-5 text-center font-semibold">{bike}</p>}

        <div className="relative mt-5 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
            <span
              className="size-2 rounded-full"
              style={{ background: statusColor[p.status] ?? "#a1a1aa" }}
            />
            {meta.label}
          </span>
          {expiry && (
            <span className="text-right text-neutral-400">
              {days !== null && days < 0 ? "Expired " : "Valid until "}
              {formatDate(expiry)}
            </span>
          )}
        </div>
      </div>

      <Button size="lg" className="h-12 text-base" onClick={save} disabled={saving}>
        <Download className="size-4" />
        {saving ? "Saving…" : "Save as image"}
      </Button>
      <p className={cn("px-4 text-center text-xs text-muted-foreground")}>
        Show this QR code to a club admin to verify your membership. Your screen stays on while this
        page is open.
      </p>
    </div>
  );
}
