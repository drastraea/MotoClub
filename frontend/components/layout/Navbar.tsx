"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { isAdmin } from "@/lib/session";

const allLinks = [
  { href: "/#about", label: "About" },
  { href: "/#events", label: "Rides" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { content } = useSiteContent();
  // Drop links to sections an admin has hidden ("/#about" -> "about").
  const links = allLinks.filter((l) => !content.hidden.includes(l.href.slice(2)));

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
        : "/dashboard";
  const accountLabel = !user
    ? "Login"
    : user.role === "visitor"
      ? "My Status"
      : "Dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLogo />
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
