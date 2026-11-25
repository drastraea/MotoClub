"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { adminNav } from "@/components/dashboard/nav";
import { usePendingCount } from "@/hooks/usePendingCount";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pending = usePendingCount();
  return <Sidebar groups={adminNav} area="Admin" pendingCount={pending} onNavigate={onNavigate} />;
}
