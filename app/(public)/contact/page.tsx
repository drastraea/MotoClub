import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";

export const metadata: Metadata = {
  title: "Contact - Motorcycle Club",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Questions about membership or events? Send us a message.
      </p>

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
