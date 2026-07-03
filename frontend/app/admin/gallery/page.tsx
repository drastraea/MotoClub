"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

// TODO: Replace with GET /gallery (see api_contract.json)
const initialImages = Array.from({ length: 8 }, (_, i) => ({ id: `${i}` }));

export default function AdminGalleryPage() {
  const [images, setImages] = useState(initialImages);

  // TODO: Replace with POST /gallery { link } (see
  // backend/internal/handler/gallery_handler.go - the real field is a
  // `link` (a path/URL to an already-hosted image), not a raw `blob` upload
  // as api_contract.json's stale Postman example suggests. No public
  // file-upload-and-get-a-link endpoint is visible yet, same gap as the
  // Join form's motorbike selfie.
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length === 0) return;
    setImages((prev) => [...prev, ...accepted.map(() => ({ id: crypto.randomUUID() }))]);
    toast.success(`${accepted.length} image(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // TODO: Replace with DELETE /gallery/:id (see api_contract.json)
  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted");
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
        {isDragActive ? "Drop images here" : "Drag & drop or click to upload images"}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative">
            <ImagePlaceholder className="aspect-square" />
            <Button
              size="icon-sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleDelete(img.id)}
              aria-label="Delete image"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
