"use client";

import Link from "next/link";
import { AtSign, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LoggedOutOnly } from "@/components/shared/LoggedOutOnly";
import { useSiteContent } from "@/hooks/useSiteContent";

const colHead = "mb-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";
const link = "text-sm text-foreground/80 transition-colors hover:text-primary";

export function Footer() {
  const { content } = useSiteContent();
  const { contact } = content;
  const wa = contact.whatsapp.replace(/\D/g, "");
  const ig = contact.instagram.replace(/^@/, "").trim();
  const show = (id: string) => !content.hidden.includes(id);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-block">
            <BrandLogo className="h-14" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Ride together. Stay family. A community of riders sharing the road.
          </p>
        </div>

        <div>
          <h4 className={colHead}>Club</h4>
          <ul className="flex flex-col gap-2.5">
            {show("about") && <li><Link href="/#about" className={link}>About</Link></li>}
            {show("benefits") && <li><Link href="/#benefits" className={link}>Benefits</Link></li>}
            <li><Link href="/#events" className={link}>Events</Link></li>
            <li><Link href="/#gallery" className={link}>Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={colHead}>Members</h4>
          <ul className="flex flex-col gap-2.5">
            <LoggedOutOnly>
              <li><Link href="/join" className={link}>Join</Link></li>
            </LoggedOutOnly>
            <li><Link href="/login" className={link}>Sign in</Link></li>
            <li><Link href="/dashboard" className={link}>My card</Link></li>
          </ul>
        </div>

        {show("contact") && (
          <div>
            <h4 className={colHead}>Contact</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/#contact" className={link}>Get in touch</Link></li>
              {wa && (
                <li>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={`${link} inline-flex items-center gap-2`}>
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                </li>
              )}
              {ig && (
                <li>
                  <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" className={`${link} inline-flex items-center gap-2`}>
                    <AtSign className="size-4" /> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>&copy; {new Date().getFullYear()} Brosqi.id. All rights reserved.</span>
          <span>Ride safe.</span>
        </div>
      </div>
    </footer>
  );
}
