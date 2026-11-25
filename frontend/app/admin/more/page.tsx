"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, Images, LayoutTemplate, LogOut, Megaphone } from "lucide-react";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { Panel, PanelList } from "@/components/dashboard/Panel";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/admin/gallery", label: "Gallery", hint: "Photos on the landing page", icon: Images },
  { href: "/admin/announcements", label: "Announcements", hint: "News for members", icon: Megaphone },
  { href: "/admin/site", label: "Site content", hint: "Edit the landing page", icon: LayoutTemplate },
  { href: "/", label: "View public site", hint: "See what visitors see", icon: ExternalLink },
];

// The less frequent admin jobs, one tap from the tab bar on a phone.
export default function AdminMorePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <DashHeader title="More" description={user?.email ?? undefined} />
      <Panel>
        <PanelList>
          {links.map(({ href, label, hint, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </PanelList>
      </Panel>
      <button
        type="button"
        onClick={signOut}
        className="flex items-center justify-center gap-2 rounded-xl bg-card px-5 py-3.5 text-sm font-semibold text-destructive shadow-xs ring-1 ring-border"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );
}
