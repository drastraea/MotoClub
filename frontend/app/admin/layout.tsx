"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomTabs } from "@/components/dashboard/BottomTabs";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { adminNav, adminTabs } from "@/components/dashboard/nav";
import { useAuth } from "@/hooks/useAuth";
import { usePendingCount } from "@/hooks/usePendingCount";
import { isAdmin } from "@/lib/session";

// Phone first: a bottom tab bar (with the Scan button in the middle) below lg,
// the sidebar from lg up.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const pending = usePendingCount();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!isAdmin(user.role)) router.replace("/dashboard");
  }, [ready, user, router]);

  if (!ready || !user || !isAdmin(user.role)) return null;

  return (
    <div data-dashboard className="flex min-h-screen flex-1 bg-muted/30">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar groups={adminNav} />
        <main id="main-content" className="flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <BottomTabs items={adminTabs} pendingCount={pending} />
    </div>
  );
}
