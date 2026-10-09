"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, LayoutDashboard, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/session";
import { initials } from "@/lib/dash-utils";

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) return null;

  const name = user.name ?? user.email ?? user.role;
  const admin = isAdmin(user.role);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
            <span className="truncate text-sm font-medium text-foreground">{name}</span>
            {user.email && <span className="truncate text-xs font-normal">{user.email}</span>}
            <span className="text-[11px] font-normal capitalize">{user.role}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(admin ? "/admin" : "/dashboard")}>
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        {!admin && (
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <User />
            My profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/")}>
          <ExternalLink />
          View public site
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
