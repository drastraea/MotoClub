"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/session";

// Members only get their own profile; the rest is admin-only.
const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/members", label: "Members", icon: Users, adminOnly: true },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays, adminOnly: true },
];

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const admin = isAdmin(user?.role);
  const visible = links.filter((l) => admin || !l.adminOnly);

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-border p-4">
      {visible.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "shape-corner-sm flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
