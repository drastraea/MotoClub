"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomTabs } from "@/components/dashboard/BottomTabs";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { memberNav } from "@/components/dashboard/nav";
import { useAuth } from "@/hooks/useAuth";

// Phone first: a bottom tab bar below lg, the sidebar from lg up.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role === "visitor") router.replace("/status");
  }, [ready, user, router]);

  if (!ready || !user || user.role === "visitor") return null;

  return (
    <div data-dashboard className="flex min-h-screen flex-1 bg-muted/30">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <DashboardSidebar />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar groups={memberNav} />
        <main id="main-content" className="flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>

      <BottomTabs groups={memberNav} />
    </div>
  );
}
