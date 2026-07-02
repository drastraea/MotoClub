"use client";

import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // TODO: Replace with real Google Identity Services sign-in + POST /login
  // (see api_contract.json) once a Google OAuth Client ID is available.
  const handleMockSignIn = () => {
    login({ name: "Alex Rider", email: "alex.rider@example.com", role: "member" });
    toast.success("Signed in (mock session)");
    router.push("/dashboard");
  };

  // Dev-only convenience since there's no real role distinction from the
  // backend yet — lets the admin panel be reached without a real account.
  const handleMockAdminSignIn = () => {
    login({ name: "Admin", email: "admin@example.com", role: "admin" });
    toast.success("Signed in as admin (mock session)");
    router.push("/admin");
  };

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
        <CardContent className="flex flex-col gap-3">
          <Button className="w-full" onClick={handleMockSignIn}>
            <LogIn className="size-4" />
            Sign in with Google
          </Button>
          <Button className="w-full" variant="outline" onClick={handleMockAdminSignIn}>
            <ShieldCheck className="size-4" />
            Continue as Admin (mock)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
