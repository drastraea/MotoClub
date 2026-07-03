"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
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

  if (!ready || !user || !isAdmin(user.role)) return null;

  return (
    <div className="flex min-h-screen flex-1">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="relative z-50 h-full w-56 bg-background">
            <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
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
