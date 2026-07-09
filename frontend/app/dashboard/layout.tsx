"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/session";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Members are limited to their own profile; every other dashboard route is
  // admin-only, so bounce non-admins to /dashboard/profile.
  const memberOffProfile =
    !!user && !isAdmin(user.role) && user.role !== "visitor" && !pathname.startsWith("/dashboard/profile");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role === "visitor") router.replace("/status");
    else if (memberOffProfile) router.replace("/dashboard/profile");
  }, [ready, user, router, memberOffProfile]);

  if (!ready || !user || user.role === "visitor" || memberOffProfile) return null;

  return (
    <div className="flex min-h-screen flex-1">
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="relative z-50 h-full w-56 bg-background">
            <DashboardSidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <DashboardTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
