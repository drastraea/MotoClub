"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/session";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#events", label: "Events" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  const accountHref = !user
    ? "/login"
    : user.role === "visitor"
      ? "/status"
      : isAdmin(user.role)
        ? "/admin"
        : "/dashboard/profile";
  const accountLabel = !user
    ? "Login"
    : user.role === "visitor"
      ? "My Status"
      : isAdmin(user.role)
        ? "Dashboard"
        : "Profile";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary/30 bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-widest uppercase"
        >
          Moto<span className="text-primary">Club</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href={accountHref}
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              {accountLabel}
            </Link>
          )}
          {user ? (
            <>
              <Link
                href={accountHref}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Hello, {user.name ?? "Rider"}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Login
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/join" />}>
                Join Now
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href={accountHref}
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {accountLabel}
            </Link>
          )}
          {user ? (
            <>
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className="self-start rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Hello, {user.name ?? "Rider"}
              </Link>
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                nativeButton={false}
                render={<Link href="/login" />}
                onClick={() => setOpen(false)}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="w-full"
                nativeButton={false}
                render={<Link href="/join" />}
                onClick={() => setOpen(false)}
              >
                Join Now
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
