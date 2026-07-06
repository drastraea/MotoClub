"use client";

import { useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import {
  clearSession,
  getRawSession,
  setSession,
  subscribe,
  type Session,
} from "@/lib/session";

function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Real session backed by the JWT from POST /login (see lib/session.ts).
 * `user` is null when signed out. `login` stores the session; `logout` revokes
 * the token on the backend (best-effort) and clears it locally.
 */
export function useAuth() {
  const mounted = useHasMounted();
  const raw = useSyncExternalStore(subscribe, getRawSession, () => null);
  const user: Session | null = mounted && raw ? (JSON.parse(raw) as Session) : null;

  const login = (session: Session) => setSession(session);

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore — clear the local session regardless.
    }
    clearSession();
  };

  return { user, ready: mounted, login, logout };
}
