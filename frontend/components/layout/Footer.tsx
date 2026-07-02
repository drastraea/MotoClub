import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-2 border-primary/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs tracking-wide text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} Moto<span className="text-primary">Club</span>. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/contact" className="hover:text-primary">
            Contact
          </Link>
          <Link href="/join" className="hover:text-primary">
            Join Now
          </Link>
        </div>
      </div>
    </footer>
  );
}
