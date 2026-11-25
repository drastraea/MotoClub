"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Check, ScanLine, TriangleAlert, User, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { QrScanner } from "@/components/dashboard/QrScanner";
import { api, type Profile } from "@/lib/api";
import { daysUntil, formatDate, initials } from "@/lib/dash-utils";
import { parseMemberId } from "@/lib/member-qr";
import { statusMeta } from "@/lib/member-status";
import { cn } from "@/lib/utils";

type Result =
  | { kind: "loading"; id: string }
  | { kind: "found"; id: string; profile: Profile }
  | { kind: "error"; message: string };

// What the admin needs to decide in one glance: is this person an active member?
function verdict(p: Profile) {
  if (p.status === "APPROVED") return { tone: "ok", label: "Valid member", icon: Check } as const;
  if (p.status === "EXPIRED") return { tone: "bad", label: "Membership expired", icon: X } as const;
  return { tone: "warn", label: statusMeta(p.status).label, icon: TriangleAlert } as const;
}

const tones = {
  ok: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  bad: "bg-red-500/15 text-red-600 dark:text-red-400",
  warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold">{children || "—"}</dd>
    </div>
  );
}

export default function AdminScanPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const lastRef = useRef<{ text: string; at: number } | null>(null);

  const lookup = useCallback(async (id: string) => {
    setResult({ kind: "loading", id });
    try {
      const profile = await api.getProfile(id);
      setResult({ kind: "found", id, profile });
    } catch (e) {
      setResult({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not find that member.",
      });
    }
  }, []);

  const onScan = useCallback(
    (text: string) => {
      // The camera sees the same code many times a second; handle each once.
      const last = lastRef.current;
      if (last && last.text === text && Date.now() - last.at < 4000) return;
      lastRef.current = { text, at: Date.now() };
      const id = parseMemberId(text);
      if (!id) {
        toast.error("That QR code is not a member card.");
        return;
      }
      void lookup(id);
    },
    [lookup]
  );

  const reset = () => {
    lastRef.current = null;
    setResult(null);
  };

  // Lets the scanner resume after "Scan next" even if the same card is shown again.
  useEffect(() => {
    if (result === null) lastRef.current = null;
  }, [result]);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseMemberId(manual);
    if (!id) {
      toast.error("Enter the numeric member ID (the number after ID on the card).");
      return;
    }
    setManual("");
    void lookup(id);
  };

  const extend = async (id: string) => {
    setBusy(true);
    try {
      await api.extendMembership(id);
      toast.success("Membership extended by 3 years");
      await lookup(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extend failed");
    } finally {
      setBusy(false);
    }
  };

  const showing = result !== null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <DashHeader title="Scan card" description="Point the camera at a member's QR code." />

      <QrScanner onScan={onScan} paused={showing} />

      {!showing && (
        <form onSubmit={submitManual} className="flex gap-2">
          <Input
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Or type the member ID"
            aria-label="Member ID"
          />
          <Button type="submit" variant="outline" className="h-8 shrink-0">
            <ScanLine className="size-4" />
            Look up
          </Button>
        </form>
      )}

      {result?.kind === "loading" && <div className="h-52 animate-pulse rounded-2xl bg-muted" />}

      {result?.kind === "error" && (
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-border">
          <p className="flex items-center gap-2 font-semibold text-destructive">
            <X className="size-5" />
            Member not found
          </p>
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <Button onClick={reset}>
            <ScanLine className="size-4" />
            Scan next
          </Button>
        </div>
      )}

      {result?.kind === "found" && (
        <ResultCard
          id={result.id}
          profile={result.profile}
          busy={busy}
          onExtend={() => extend(result.id)}
          onNext={reset}
        />
      )}
    </div>
  );
}

function ResultCard({
  id,
  profile: p,
  busy,
  onExtend,
  onNext,
}: {
  id: string;
  profile: Profile;
  busy: boolean;
  onExtend: () => void;
  onNext: () => void;
}) {
  const v = verdict(p);
  const Icon = v.icon;
  const expiry = p.membershipExpiresAt;
  const days = expiry ? daysUntil(expiry) : null;
  const canExtend = p.status === "APPROVED" || p.status === "EXPIRED";
  const bike = [p.motorbikeBrand, p.motorbikeType].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-border">
      <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold", tones[v.tone])}>
        <span className="flex size-6 items-center justify-center rounded-full bg-current/15">
          <Icon className="size-4" />
        </span>
        {v.label}
      </div>

      <div className="flex items-center gap-4">
        {p.riderPhotoLinkPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.riderPhotoLinkPath} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
            {initials(p.name)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-heading truncate text-2xl leading-tight font-bold tracking-wide uppercase">
            {p.name}
          </h2>
          <p className="text-xs text-muted-foreground">ID {id.padStart(5, "0")}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Fact label="Plate">
          <span className="font-mono tracking-wide">{p.plateNumber}</span>
        </Fact>
        <Fact label="Bike">{bike}</Fact>
        <Fact label="Valid until">{expiry ? formatDate(expiry) : ""}</Fact>
        <Fact label="Time left">
          {days === null ? "" : days < 0 ? `Expired ${-days} days ago` : `${days} days`}
        </Fact>
      </dl>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" nativeButton={false} render={<Link href={`/admin/members/${id}`} />}>
          <User className="size-4" />
          Open profile
        </Button>
        <Button className="h-11" onClick={onNext}>
          <ScanLine className="size-4" />
          Scan next
        </Button>
      </div>
      {canExtend && p.status === "EXPIRED" && (
        <Button variant="outline" className="h-11" disabled={busy} onClick={onExtend}>
          <CalendarPlus className="size-4" />
          Renew +3 years
        </Button>
      )}
    </div>
  );
}
