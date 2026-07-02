import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Motorcycle Club. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/join" className="hover:text-foreground">
            Join Now
          </Link>
        </div>
      </div>
    </footer>
  );
}
