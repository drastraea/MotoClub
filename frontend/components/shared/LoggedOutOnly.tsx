"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

// The admin site-content editor renders the landing sections as a preview. Those
// sections hide "Join" CTAs for signed-in users, which would make them vanish
// from the admin's own preview, so the preview opts out via this provider.
const PreviewContext = createContext(false);
export const SitePreviewProvider = PreviewContext.Provider;

// Renders its children only for signed-out visitors. Used to hide "Join Now"
// CTAs once a member is logged in. Children still render during SSR / before
// mount (so logged-out visitors see them immediately); they disappear only once
// we know a user is authenticated.
export function LoggedOutOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const preview = useContext(PreviewContext);
  if (ready && user && !preview) return null;
  return <>{children}</>;
}
