"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";

// Single-image drag-and-drop uploader with preview, matching the gallery's drop
// area. `value` is the current image URL (empty = none); `onChange` receives the
// new URL from uploadImage, or "" when cleared.
export function ImageDropzone({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setBusy(true);
      try {
        onChange(await uploadImage(file));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="max-h-40 w-full rounded-lg border border-border object-cover"
          />
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
            aria-label="Remove image"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <div
        {...getRootProps()}
        className="shape-corner flex cursor-pointer flex-col items-center gap-2 border border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:bg-muted"
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-6" />
        {busy
          ? "Uploading…"
          : isDragActive
            ? "Drop image here"
            : value
              ? "Drag & drop or click to replace"
              : "Drag & drop or click to upload"}
      </div>
    </div>
  );
}
