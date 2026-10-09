"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Eye, EyeOff, Images, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

export default function AdminGalleryPage() {
  const { data: images, loading, error, reload } = useApiData(
    useCallback(() => api.getGallery(), []),
    []
  );
  const [uploading, setUploading] = useState(false);

  // Each dropped file is uploaded (POST /uploads) and then registered as a
  // gallery item (POST /gallery { link }). New items are private until toggled.
  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return;
      setUploading(true);
      try {
        for (const file of accepted) {
          const link = await uploadImage(file);
          await api.createGalleryItem(link, false);
        }
        toast.success(`${accepted.length} image(s) added`);
        await reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [reload]
  );

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      await api.updateGalleryItem(id, isPublic);
      toast.success(isPublic ? "Now public" : "Now private");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.deleteGalleryItem(id);
      toast.success("Image deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title="Gallery"
        description="Photos for the landing-page gallery. New uploads stay private until you make them public."
      />

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <span className="flex size-10 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="size-5" />
        </span>
        <p className="font-medium text-foreground">
          {uploading ? "Uploading…" : isDragActive ? "Drop images here" : "Drag & drop images"}
        </p>
        {!uploading && !isDragActive && <p className="text-xs">or click to browse</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {images && images.length === 0 && (
        <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Images className="size-4" />
          No photos yet. Drop the first ones above.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images?.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.link}
              alt="Gallery item"
              className="aspect-square w-full object-cover"
            />
            {img.is_public && (
              <Badge variant="secondary" className="absolute top-2 left-2">
                Public
              </Badge>
            )}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                size="icon-sm"
                variant="secondary"
                onClick={() => togglePublic(img.id, !img.is_public)}
                aria-label={img.is_public ? "Make private" : "Make public"}
              >
                {img.is_public ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={() => handleDelete(img.id)}
                aria-label="Delete image"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
