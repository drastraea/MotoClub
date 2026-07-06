"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { api, ApiError } from "@/lib/api";
import { decodeJwtPayload, isAdmin, type Role } from "@/lib/session";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleCredential = useCallback(
    async (idToken: string) => {
      const googleClaims = decodeJwtPayload<{ email: string; name?: string }>(idToken);
      if (!googleClaims?.email) {
        toast.error("Could not read your Google account email.");
        return;
      }
      try {
        const { id, token } = await api.login(googleClaims.email, idToken);
        const appClaims = decodeJwtPayload<{ role: Role }>(token);
        const role = appClaims?.role ?? "member";
        login({ id, token, role, name: googleClaims.name, email: googleClaims.email });
        toast.success("Signed in");
        router.push(isAdmin(role) ? "/admin" : "/dashboard");
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 401
            ? "This Google account isn't registered yet. Apply to join first."
            : err instanceof Error
              ? err.message
              : "Sign in failed";
        toast.error(msg);
      }
    },
    [login, router]
  );

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl tracking-wide uppercase">
            Member Login
          </CardTitle>
          <CardDescription>
            Sign in with the Google account used on your membership application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <GoogleSignInButton onCredential={handleCredential} text="signin_with" />
        </CardContent>
      </Card>
    </div>
  );
}
