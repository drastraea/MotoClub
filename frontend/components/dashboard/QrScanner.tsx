"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff } from "lucide-react";

// Live camera view that reports each QR code it reads. jsQR works on every
// browser (the native BarcodeDetector API is missing on iOS Safari).
export function QrScanner({
  onScan,
  paused,
}: {
  onScan: (text: string) => void;
  /** Stops reading (the camera stays on) while a result is being shown. */
  paused: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const pausedRef = useRef(paused);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    pausedRef.current = paused;
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let last = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (!video || !ctx || pausedRef.current || video.readyState < 2) return;
      if (now - last < 120) return; // ~8 reads a second is plenty
      last = now;

      const scale = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code?.data) {
        navigator.vibrate?.(60);
        onScanRef.current(code.data);
      }
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser cannot open the camera.");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        raf = requestAnimationFrame(tick);
      } catch (e) {
        const denied = e instanceof DOMException && e.name === "NotAllowedError";
        setError(
          denied
            ? "Camera access was blocked. Allow it in your browser settings, or enter the member ID instead."
            : e instanceof Error
              ? e.message
              : "Could not start the camera."
        );
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="on-dark flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-3xl bg-neutral-950 p-8 text-center text-neutral-300">
        <CameraOff className="size-8 text-neutral-500" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="on-dark relative aspect-square w-full overflow-hidden rounded-3xl bg-neutral-950">
      <video ref={videoRef} playsInline muted className="size-full object-cover" />
      <div aria-hidden className="pointer-events-none absolute inset-[14%]">
        {(["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"] as const).map((c) => (
          <i key={c} className={`absolute size-10 border-primary ${c}`} />
        ))}
        {!paused && (
          <span className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse bg-primary shadow-[0_0_18px_var(--primary)]" />
        )}
      </div>
    </div>
  );
}
