"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { adminNav } from "@/components/dashboard/nav";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: pending } = useApiData(
    useCallback(() => api.getRegistrationCount(), []),
    []
  );

  return (
    <Sidebar groups={adminNav} area="Admin" pendingCount={pending ?? 0} onNavigate={onNavigate} />
  );
}
