"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

// Thin amber strip above the navbar showing the latest announcement the current
// visitor may see (public ones for anonymous visitors). Hidden when there is
// none, and dismissible for the rest of the visit.
export function AnnouncementBar() {
  const { data } = useApiData(useCallback(() => api.getAnnouncements(), []), []);
  const [dismissed, setDismissed] = useState(false);
  const latest = data?.[0];
  if (!latest || dismissed) return null;

  return (
    <div className="relative bg-primary px-10 py-2 text-center text-sm font-semibold text-primary-foreground">
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <Megaphone className="size-4 shrink-0" />
        <span>{latest.title}</span>
        <Link href="/#announcements" className="underline underline-offset-2">
          Read more
        </Link>
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 hover:bg-black/10"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
