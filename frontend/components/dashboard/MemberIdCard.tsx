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
      <dt className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{children || "—"}</dd>
    </div>
  );
}

// The digital version of the printed member ID card. Deliberately the one
// brand-forward element on the dashboard: dark card, amber glow, two QR codes.
export function MemberIdCard({ profile, memberId }: { profile: Profile; memberId: string }) {
  const origin = useOrigin();

  const meta = statusMeta(profile.status);
  const expiry = profile.membershipExpiresAt;
  const days = expiry ? daysUntil(expiry) : null;
  const remaining = days === null ? 0 : Math.max(0, Math.min(100, (days / TERM_DAYS) * 100));
  const bike = [profile.motorbikeBrand, profile.motorbikeType].filter(Boolean).join(" ");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-950 p-6 text-neutral-50 shadow-lg ring-1 ring-white/10 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-28 size-80 rounded-full bg-primary/25 blur-3xl"
      />
      <div className="relative grid gap-8 sm:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex items-center gap-4">
            {profile.riderPhotoLinkPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.riderPhotoLinkPath}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover ring-2 ring-primary/60"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-lg font-semibold text-primary ring-2 ring-primary/40">
                {initials(profile.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.25em] text-primary uppercase">
                Brosqi.id member
              </p>
              <h2 className="truncate text-xl font-semibold sm:text-2xl">{profile.name}</h2>
              <p className="text-xs text-neutral-400 tabular-nums">
                ID · {String(memberId).padStart(5, "0")}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Motorbike">{bike}</Field>
            <Field label="Plate">
              <span className="font-mono tracking-wider">{profile.plateNumber}</span>
            </Field>
            <Field label="Member since">{formatDate(profile.created_at)}</Field>
            <Field label="Valid until">{expiry ? formatDate(expiry) : ""}</Field>
          </dl>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium">
                <span className={cn("size-1.5 rounded-full", dot[profile.status] ?? "bg-neutral-400")} />
                {meta.label}
              </span>
              {days !== null && (
                <span className="text-neutral-400 tabular-nums">
                  {days >= 0 ? `${days} days left` : `Expired ${-days} days ago`}
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

        <div className="flex items-start justify-center gap-5 sm:flex-col sm:items-center">
          <figure className="flex flex-col items-center gap-1.5">
            <div className="rounded-xl bg-white p-2">
              <QrCode value={`${origin}/admin/members/${memberId}`} size={112} />
            </div>
            <figcaption className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
              Member
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1.5">
            <div className="rounded-xl bg-white p-1.5">
              <QrCode value={`${origin}/#benefits`} size={72} />
            </div>
            <figcaption className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
              Benefits
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
