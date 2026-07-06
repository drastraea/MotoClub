// Shared post-Google-Sign-In flow: exchange the Google ID token for our own
// session (POST /login), then route based on role. Used by both the Login
// page and the Join form (when it turns out the account is already
// registered - no need to make the user sign in with Google a second time).

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { decodeJwtPayload, isAdmin, type Role, type Session } from "@/lib/session";

export async function completeGoogleLogin(
  email: string,
  idToken: string,
  name: string | undefined,
  login: (session: Session) => void,
  router: ReturnType<typeof useRouter>
) {
  const { id, token } = await api.login(email, idToken);
  const appClaims = decodeJwtPayload<{ role: Role }>(token);
  const role = appClaims?.role ?? "member";
  login({ id, token, role, name, email });

  if (role === "visitor") {
    toast.info("Your membership application is still pending approval.");
    router.push("/status");
    return;
  }

  toast.success("Signed in");
  router.push(isAdmin(role) ? "/admin" : "/dashboard");
}
