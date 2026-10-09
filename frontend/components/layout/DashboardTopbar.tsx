"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { currentLabel, type NavGroup } from "@/components/dashboard/nav";

export function DashboardTopbar({
  groups,
  onMenuClick,
}: {
  groups: NavGroup[];
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const title = currentLabel(groups, pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
          </Button>
        )}
        <p className="truncate text-sm font-semibold">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <ExternalLink className="size-4" />
          View site
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
