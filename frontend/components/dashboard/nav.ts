import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  Images,
  Megaphone,
  LayoutTemplate,
  User,
  Gift,
  IdCard,
  ScanLine,
  Ellipsis,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for index routes like /admin). */
  exact?: boolean;
  /** Extra path prefixes that also count as this item being active. */
  also?: string[];
  /** Show the pending-applications count next to this item. */
  badge?: "pending";
  /** Shorter label for the phone tab bar. */
  tabLabel?: string;
  /** Render as the raised centre button on the phone tab bar. */
  fab?: boolean;
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
      { href: "/admin/scan", label: "Scan card", icon: ScanLine },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/site", label: "Site Content", icon: LayoutTemplate },
      { href: "/admin/theme", label: "Theme", icon: Palette },
    ],
  },
];

// The phone tab bar for admins: the jobs done on the go. Everything else is
// one tap away under More.
export const adminTabs: NavItem[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Members", icon: Users, also: ["/admin/members"], badge: "pending" },
  { href: "/admin/scan", label: "Scan", icon: ScanLine, fab: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  {
    href: "/admin/more",
    label: "More",
    icon: Ellipsis,
    also: ["/admin/gallery", "/admin/announcements", "/admin/site", "/admin/theme"],
  },
];

// The five member screens. Phones show them as the bottom tab bar, larger
// screens as the sidebar.
export const memberNav: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/events", label: "Events", icon: CalendarDays },
      { href: "/dashboard/benefits", label: "Benefits", icon: Gift },
      { href: "/dashboard/card", label: "My card", icon: IdCard },
      { href: "/dashboard/profile", label: "Profile", icon: User, tabLabel: "Me" },
    ],
  },
];

function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href.includes("#")) return false;
  if (item.exact) return pathname === item.href;
  return under(pathname, item.href) || (item.also ?? []).some((p) => under(pathname, p));
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
