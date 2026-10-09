"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { memberNav } from "@/components/dashboard/nav";

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return <Sidebar groups={memberNav} area="Member" onNavigate={onNavigate} />;
}
