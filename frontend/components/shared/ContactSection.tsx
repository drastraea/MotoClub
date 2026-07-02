import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";

export function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          Get In Touch
        </span>
        <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
          Contact Us
        </h2>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <MapPin className="size-5" />
            Club HQ, 123 Rider Street
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-5" />
            +62 812-0000-0000
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-5" />
            hello@motorcycleclub.example
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
