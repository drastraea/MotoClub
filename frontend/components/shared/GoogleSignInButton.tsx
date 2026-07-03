"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (res: CredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi load failed"));
    document.head.appendChild(script);
  });
}

/**
 * Renders Google's Sign-In button. On success, passes the Google ID token
 * (a JWT) to onCredential — the caller sends it to the backend as `googleToken`.
 */
export function GoogleSignInButton({
  onCredential,
  text = "signin_with",
}: {
  onCredential: (idToken: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.googleClientId) {
      setError("Google Sign-In is not configured (set NEXT_PUBLIC_GOOGLE_CLIENT_ID).");
      return;
    }
    let cancelled = false;
    loadGsiScript()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (res) => onCredential(res.credential),
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          text,
          width: 280,
        });
      })
      .catch(() => setError("Failed to load Google Sign-In."));
    return () => {
      cancelled = true;
    };
  }, [onCredential, text]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  return <div ref={ref} />;
}
