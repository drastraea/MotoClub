"use client";

import { useAuth } from "@/hooks/useAuth";

// Renders its children only for signed-out visitors. Used to hide "Join Now"
// CTAs once a member is logged in. Children still render during SSR / before
// mount (so logged-out visitors see them immediately); they disappear only once
// we know a user is authenticated.
export function LoggedOutOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (ready && user) return null;
  return <>{children}</>;
}
