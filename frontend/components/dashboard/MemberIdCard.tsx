"use client";

import { QrCode } from "@/components/shared/QrCode";
import { useOrigin } from "@/hooks/useOrigin";
import type { Profile } from "@/lib/api";
import { daysUntil, formatDate, initials } from "@/lib/dash-utils";
import { statusMeta } from "@/lib/member-status";
import { cn } from "@/lib/utils";

const TERM_DAYS = 3 * 365;

const dot: Record<string, string> = {
  APPROVED: "bg-emerald-400",
  EXPIRED: "bg-red-400",
  REJECTED: "bg-red-400",
  PENDING_APPROVAL: "bg-amber-400",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{children || "—"}</dd>
    </div>
  );
}

// Compact digital member card for the home screen. The one brand-forward element
// on the dashboard: dark card, amber glow. The full-size QR lives on the My card tab.
export function MemberIdCard({ profile, memberId }: { profile: Profile; memberId: string }) {
  const origin = useOrigin();

  const meta = statusMeta(profile.status);
  const expiry = profile.membershipExpiresAt;
  const days = expiry ? daysUntil(expiry) : null;
  const remaining = days === null ? 0 : Math.max(0, Math.min(100, (days / TERM_DAYS) * 100));
  const bike = [profile.motorbikeBrand, profile.motorbikeType].filter(Boolean).join(" ");

  return (
    <div className="relative overflow-hidden rounded-[24px_24px_6px_24px] bg-neutral-950 p-5 text-neutral-50 shadow-lg ring-1 ring-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-3.5">
          {profile.riderPhotoLinkPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.riderPhotoLinkPath}
              alt=""
              className="size-14 shrink-0 rounded-xl object-cover ring-2 ring-primary/60"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-lg font-semibold text-primary ring-2 ring-primary/40">
              {initials(profile.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.25em] text-primary uppercase">
              Brosqi.id member
            </p>
            <h2 className="font-heading truncate text-xl leading-tight font-bold tracking-wide uppercase">
              {profile.name}
            </h2>
            <p className="text-xs text-neutral-400 tabular-nums">ID {memberId.padStart(5, "0")}</p>
          </div>
          <div className="shrink-0 rounded-lg bg-white p-1.5">
            <QrCode value={`${origin}/admin/members/${memberId}`} size={56} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Motorbike">{bike}</Field>
          <Field label="Plate">
            <span className="font-mono tracking-wider">{profile.plateNumber}</span>
          </Field>
        </dl>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium">
              <span className={cn("size-1.5 rounded-full", dot[profile.status] ?? "bg-neutral-400")} />
              {meta.label}
            </span>
            {expiry && (
              <span className="text-neutral-400">
                {days !== null && days < 0 ? "Expired " : "Valid until "}
                {formatDate(expiry)}
              </span>
            )}
          </div>
          {days !== null && (
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full", days < 0 ? "bg-red-400" : "bg-primary")}
                style={{ width: `${remaining}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
