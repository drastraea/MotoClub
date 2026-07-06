// Client-side session store: the JWT issued by POST /login plus the identity we
// need for UI (id, role, name, email). Backed by localStorage and broadcast via
// a custom event so useAuth() can subscribe with useSyncExternalStore.

export type Role = "visitor" | "member" | "admin" | "superadmin";

export type Session = {
  id: string;
  token: string;
  role: Role;
  name?: string;
  email?: string;
};

export const SESSION_KEY = "moto-club-session";
export const AUTH_EVENT = "moto-club-auth-changed";

export function getRawSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function getSession(): Session | null {
  const raw = getRawSession();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function setSession(session: Session): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function isAdmin(role: Role | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

/** Decode a JWT payload (no verification) — used to read email/name out of a
 *  Google ID token on the client before sending it to the backend. */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
