import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  Images,
  Megaphone,
  LayoutTemplate,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for index routes like /admin). */
  exact?: boolean;
  /** Show the pending-applications count next to this item. */
  badge?: "pending";
};

export type NavGroup = { label?: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Members",
    items: [
      { href: "/admin/members", label: "Applications", icon: UserCheck, badge: "pending" },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/site", label: "Site Content", icon: LayoutTemplate },
    ],
  },
];

export const memberNav: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
  {
    label: "Club",
    items: [
      { href: "/#events", label: "Events", icon: CalendarDays },
      { href: "/#announcements", label: "Announcements", icon: Megaphone },
      { href: "/#gallery", label: "Gallery", icon: Images },
    ],
  },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href.includes("#")) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

/** Label of the nav item matching the current path (for the topbar title). */
export function currentLabel(groups: NavGroup[], pathname: string): string {
  for (const g of groups) {
    for (const item of g.items) {
      if (isActive(pathname, item)) return item.label;
    }
  }
  return "";
}
