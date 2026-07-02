"use client";

import { useSyncExternalStore } from "react";

export type MockUser = {
  name: string;
  email: string;
  role: "member" | "admin";
};

const STORAGE_KEY = "moto-club-mock-session";
const EVENT_NAME = "moto-club-auth-changed";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// TODO: Replace with a real session backed by the JWT from POST /login
// (see api_contract.json) once Google Sign-In is wired up.
export function useAuth() {
  const mounted = useHasMounted();
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user: MockUser | null = mounted && raw ? JSON.parse(raw) : null;

  const login = (mockUser: MockUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  return { user, ready: mounted, login, logout };
}
