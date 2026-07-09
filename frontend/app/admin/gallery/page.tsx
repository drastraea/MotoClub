"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Eye, EyeOff, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { uploadImage } from "@/lib/upload";

export default function AdminGalleryPage() {
  const { data: images, loading, error, reload } = useApiData(
    useCallback(() => api.getGallery(), []),
    []
  );
  const [uploading, setUploading] = useState(false);

  // POST /gallery { link }. The backend stores a link to an already-hosted
  // image (no upload endpoint), so dropped files are inlined as base64 data
  // URIs to use as that link. New items are private (is_public: false) until
  // toggled public below.
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
    try {
      await api.deleteGalleryItem(id);
      toast.success("Image deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Gallery Management
      </h1>

      <div
        {...getRootProps()}
        className="shape-corner mt-8 flex cursor-pointer flex-col items-center gap-2 border border-dashed border-border p-8 text-center text-sm text-muted-foreground hover:bg-muted"
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-6" />
        {uploading
          ? "Uploading…"
          : isDragActive
            ? "Drop images here"
            : "Drag & drop or click to upload images"}
      </div>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images?.map((img) => (
          <div key={img.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.link}
              alt="Gallery item"
              className="aspect-square w-full rounded-lg border border-border object-cover"
            />
            {img.is_public && (
              <Badge variant="secondary" className="absolute top-2 left-2">
                Public
              </Badge>
            )}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
