import Link from "next/link";
import { MapPin, Phone, Clock, AtSign } from "lucide-react";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";

const contactInfo = [
  { icon: MapPin, title: "Our Location", body: "Club HQ, 123 Rider Street" },
  { icon: Phone, title: "Get in Touch", body: "+62 812-0000-0000" },
  { icon: Clock, title: "Clubhouse Hours", body: "Everyday: 9:00 AM - 9:00 PM" },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-primary/30">
      <div className="border-b border-border py-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:px-6">
          {contactInfo.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="shape-corner-sm flex size-14 items-center justify-center bg-primary/10 ring-1 ring-primary/30">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold tracking-wide uppercase">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-widest uppercase"
        >
          Brosqi<span className="text-primary">.id</span>
        </Link>

        <div className="flex flex-col items-center gap-4 text-xs tracking-wide text-muted-foreground uppercase sm:flex-row sm:gap-6">
          <Link href="/#contact" className="hover:text-primary">
            Contact
          </Link>
          <LoggedOutOnly>
            <Link href="/join" className="hover:text-primary">
              Join Now
            </Link>
          </LoggedOutOnly>
          {/* TODO: Replace with the real club Instagram profile URL. */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex size-8 items-center justify-center rounded-full bg-muted hover:text-primary"
          >
            <AtSign className="size-4" />
          </a>
        </div>

        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          &copy; {new Date().getFullYear()} Brosqi.id. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
