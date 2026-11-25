import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/shared/ContactForm";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";

export function ContactSection({
  data = defaultSiteContent.contact,
}: {
  data?: SiteContent["contact"];
}) {
  const wa = data.whatsapp.replace(/\D/g, "");
  const ig = data.instagram.replace(/^@/, "").trim();

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-border bg-muted/40 py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            {data.eyebrow}
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            {data.heading}
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Questions about joining, rides or sponsorship? Message us.
          </p>

          <ul className="mt-8 flex flex-col gap-4 text-muted-foreground">
            <li className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                <MapPin className="size-5" />
              </span>
              {data.address}
            </li>
            <li className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                <Phone className="size-5" />
              </span>
              {data.phone}
            </li>
            <li className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                <Mail className="size-5" />
              </span>
              {data.email}
            </li>
          </ul>

          {(wa || ig) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {wa && (
                <Button
                  variant="outline"
                  className="h-11 border-[#25d366] text-[#25d366] hover:bg-[#25d366]/10 hover:text-[#25d366]"
                  nativeButton={false}
                  render={<a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" />}
                >
                  <MessageCircle className="size-4" />
                  Chat on WhatsApp
                </Button>
              )}
              {ig && (
                <Button
                  variant="outline"
                  className="h-11"
                  nativeButton={false}
                  render={
                    <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" />
                  }
                >
                  <AtSign className="size-4" />@{ig}
                </Button>
              )}
            </div>
          )}
        </div>

        <ContactForm whatsapp={data.whatsapp} email={data.email} />
      </div>
    </section>
  );
}
