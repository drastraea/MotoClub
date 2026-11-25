import QRCode from "qrcode";
import { initials } from "@/lib/dash-utils";

export type CardImageInput = {
  name: string;
  memberId: string;
  plate: string;
  bike: string;
  statusLabel: string;
  statusColor: string;
  validUntil: string | null;
  photoUrl?: string;
  /** What the QR code encodes. */
  qrValue: string;
};

const W = 900;
const H = 1260;

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // Without CORS headers the canvas would be tainted and unexportable, so a
    // failed load just means the card is drawn without the photo.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function cssFont(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Draws the member card to a PNG and downloads it. Runs in the browser only. */
export async function downloadCardImage(input: CardImageInput): Promise<void> {
  const heading = cssFont("--font-oswald", "Oswald, Impact, sans-serif");
  const sans = cssFont("--font-geist-sans", "system-ui, sans-serif");
  await Promise.all([
    document.fonts.load(`700 48px ${heading}`),
    document.fonts.load(`600 28px ${sans}`),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser cannot draw the card image.");

  // Card body
  rrect(ctx, 0, 0, W, H, [72, 72, 20, 72]);
  ctx.fillStyle = "#0b0b0c";
  ctx.fill();
  ctx.save();
  ctx.clip();
  const glow = ctx.createRadialGradient(W * 0.85, 40, 0, W * 0.85, 40, 520);
  glow.addColorStop(0, "rgba(245,158,11,0.40)");
  glow.addColorStop(1, "rgba(245,158,11,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  rrect(ctx, 1.5, 1.5, W - 3, H - 3, [72, 72, 20, 72]);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Photo or initials
  const px = 72;
  const py = 72;
  const ps = 170;
  const photo = input.photoUrl ? await loadImage(input.photoUrl) : null;
  ctx.save();
  rrect(ctx, px, py, ps, ps, [40, 40, 40, 40]);
  ctx.clip();
  if (photo) {
    const s = Math.max(ps / photo.width, ps / photo.height);
    ctx.drawImage(photo, px + (ps - photo.width * s) / 2, py + (ps - photo.height * s) / 2, photo.width * s, photo.height * s);
  } else {
    ctx.fillStyle = "rgba(245,158,11,0.22)";
    ctx.fillRect(px, py, ps, ps);
    ctx.fillStyle = "#f59e0b";
    ctx.font = `700 64px ${heading}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(input.name), px + ps / 2, py + ps / 2 + 4);
  }
  ctx.restore();
  rrect(ctx, px, py, ps, ps, [40, 40, 40, 40]);
  ctx.strokeStyle = "rgba(245,158,11,0.75)";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Name block
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const tx = px + ps + 44;
  ctx.fillStyle = "#f59e0b";
  ctx.font = `600 24px ${sans}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
  ctx.fillText("BROSQI.ID MEMBER", tx, py + 52);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "1px";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 64px ${heading}`;
  ctx.fillText(input.name.toUpperCase().slice(0, 22), tx, py + 118);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.fillStyle = "#a1a1aa";
  ctx.font = `500 28px ${sans}`;
  ctx.fillText(`ID ${input.memberId.padStart(5, "0")}  ·  ${input.plate || "-"}`, tx, py + 162);

  // QR
  const qrSize = 560;
  const qx = (W - qrSize - 80) / 2;
  const qy = 330;
  rrect(ctx, qx, qy, qrSize + 80, qrSize + 80, [44, 44, 44, 44]);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, input.qrValue, { margin: 0, width: qrSize, errorCorrectionLevel: "M" });
  ctx.drawImage(qrCanvas, qx + 40, qy + 40, qrSize, qrSize);

  // Footer: bike, status, expiry
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 34px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText(input.bike || "", W / 2, 1020);

  ctx.font = `600 28px ${sans}`;
  const pill = input.statusLabel;
  const pw = ctx.measureText(pill).width + 84;
  rrect(ctx, 72, 1100, pw, 64, [32, 32, 32, 32]);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(72 + 32, 1132, 9, 0, Math.PI * 2);
  ctx.fillStyle = input.statusColor;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(pill, 72 + 54, 1142);

  if (input.validUntil) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 28px ${sans}`;
    ctx.fillText(`Valid until ${input.validUntil}`, W - 72, 1142);
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the image.");
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `brosqi-member-card-${input.memberId}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}
