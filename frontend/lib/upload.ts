import { config } from "@/lib/config";

// Uploads a picked image file to the backend and returns its hosted URL, which
// every caller just stores wherever a link/imageLink field is needed.
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${config.apiBaseUrl}/uploads`, { method: "POST", body });
  const data = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message = (data && typeof data === "object" && "error" in data && String(data.error)) || "Upload failed";
    throw new Error(message);
  }
  return (data as { link: string }).link;
}
