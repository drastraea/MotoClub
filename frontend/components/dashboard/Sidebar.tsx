"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActive, type NavGroup } from "@/components/dashboard/nav";

// Shared sidebar for the admin and member dashboards: brand, grouped nav with an
// accent bar on the active item, optional pending-count badge, link back to site.
export function Sidebar({
  groups,
  area,
  pendingCount,
  onNavigate,
}: {
  groups: NavGroup[];
  area: string;
  pendingCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="font-heading text-lg font-bold tracking-widest uppercase"
        >
          Brosqi<span className="text-primary">.id</span>
        </Link>
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {area}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={`${area} navigation`}>
        {groups.map((group, i) => (
          <div key={group.label ?? i} className={i > 0 ? "mt-6" : undefined}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-primary/10 text-foreground"
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                      )}
                      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                      <span className="truncate">{item.label}</span>
                      {item.badge === "pending" && !!pendingCount && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground tabular-nums">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View public site
        </Link>
      </div>
    </aside>
  );
}
