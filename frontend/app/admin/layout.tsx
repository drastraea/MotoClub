"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { adminNav } from "@/components/dashboard/nav";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/session";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!isAdmin(user.role)) router.replace("/dashboard");
  }, [ready, user, router]);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  if (!ready || !user || !isAdmin(user.role)) return null;

  return (
    <div data-dashboard className="flex min-h-screen flex-1 bg-muted/30">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="relative z-50 h-full w-64 shadow-xl">
            <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar groups={adminNav} onMenuClick={() => setMobileNavOpen(true)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
