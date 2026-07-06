"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { ApiError } from "@/lib/api";
import { decodeJwtPayload } from "@/lib/session";
import { completeGoogleLogin } from "@/lib/auth-flow";
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
        await completeGoogleLogin(googleClaims.email, idToken, googleClaims.name, login, router);
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
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

      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
        <ArrowLeft className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}
