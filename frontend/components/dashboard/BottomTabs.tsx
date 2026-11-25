"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, type NavItem } from "@/components/dashboard/nav";

// Thumb-reach navigation for phones. Hidden from the lg breakpoint up, where the
// sidebar takes over. An item marked `fab` becomes the raised centre button.
export function BottomTabs({ items, pendingCount }: { items: NavItem[]; pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          const label = item.tabLabel ?? item.label;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.fab ? (
                  <span
                    className={cn(
                      "-mt-7 flex size-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg shadow-primary/40",
                      active && "ring-2 ring-primary/50"
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                ) : (
                  <Icon className="size-[22px]" />
                )}
                <span className={cn(item.fab && "text-foreground")}>{label}</span>
                {item.badge === "pending" && !!pendingCount && (
                  <span className="absolute top-1.5 left-[calc(50%+8px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
