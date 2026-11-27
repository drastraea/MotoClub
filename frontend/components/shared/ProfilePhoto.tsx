"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { initials } from "@/lib/dash-utils";
import { uploadImage } from "@/lib/upload";

// The member's own photo; tapping it picks a new one and saves it right away.
export function ProfilePhoto({
  memberId,
  name,
  photo,
  onChanged,
}: {
  memberId: string;
  name: string;
  photo: string;
  onChanged: () => Promise<unknown>;
}) {
  const [saving, setSaving] = useState(false);

  const change = async (file: File) => {
    setSaving(true);
    try {
      await api.updatePhoto(memberId, await uploadImage(file));
      await onChanged();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change the photo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="flex shrink-0 cursor-pointer flex-col items-center gap-2">
      <span className="relative block size-24 rounded-full">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full rounded-full object-cover ring-2 ring-primary/40" />
        ) : (
          <span className="flex size-full items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {initials(name)}
          </span>
        )}
        <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </span>
      <input
        type="file"
        // Listing the types makes iPhones hand over a JPEG instead of HEIC.
        accept="image/jpeg,image/png,image/webp"
        className="peer sr-only"
        disabled={saving}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // lets the same file be picked again
          if (file) void change(file);
        }}
      />
      <span className="rounded-sm text-xs font-medium text-muted-foreground underline underline-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        {saving ? "Saving…" : "Change photo"}
      </span>
    </label>
  );
}
