import { config } from "@/lib/config";

// Downscale/recompress large photos in the browser before upload. A raw phone
// photo is often 10-15 MB; at 1920 px longest edge and JPEG q0.85 it drops to
// ~1 MB, which keeps well clear of the backend's 20 MB cap and avoids the
// "failed to fetch" you get when a huge multipart body is rejected mid-stream.
// ponytail: browser-only (canvas / createImageBitmap); no server-side path.
const MAX_DIM = 1920;
const JPEG_QUALITY = 0.85;
const HARD_LIMIT = 15 * 1024 * 1024;
const SKIP_UNDER = 2 * 1024 * 1024;

async function downscaleImage(file: File): Promise<File> {
  // Only raster types a canvas can re-encode; leave gif/svg/heic to the server.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  if (file.size < SKIP_UNDER) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // decode failed — let the server try the original
  }

  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType, JPEG_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file; // no gain — keep original

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  const ext = outType === "image/png" ? "png" : "jpg";
  return new File([blob], `${base}.${ext}`, { type: outType });
}

// Uploads a picked image file to the backend and returns its hosted URL, which
// every caller just stores wherever a link/imageLink field is needed.
export async function uploadImage(file: File): Promise<string> {
  const prepared = await downscaleImage(file);

  if (prepared.size > HARD_LIMIT) {
    const mb = (prepared.size / 1024 / 1024).toFixed(1);
    throw new Error(`Image is ${mb} MB after compression — please pick a smaller one (max 15 MB).`);
  }

  const body = new FormData();
  body.append("file", prepared);

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}/uploads`, { method: "POST", body });
  } catch {
    throw new Error("Couldn't reach the server — check your connection and try again.");
  }

  const data = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && String(data.error)) ||
      `Upload failed (${res.status})`;
    throw new Error(message);
  }
  return (data as { link: string }).link;
}
