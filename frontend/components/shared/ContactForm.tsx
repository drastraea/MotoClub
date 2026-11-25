"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  message: z.string().min(10, "Message is too short"),
});

type ContactValues = z.infer<typeof contactSchema>;

// There is no server endpoint for messages, so this hands the message to the
// visitor's own WhatsApp (preferred) or email app, prefilled. Nothing is sent
// until they press send there, and we never claim it was.
export function ContactForm({ whatsapp, email }: { whatsapp?: string; email?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const digits = (whatsapp ?? "").replace(/\D/g, "");
  const canSend = digits.length > 0 || !!email;

  const onSubmit = (values: ContactValues) => {
    const text = `Hi, I'm ${values.name}.\n\n${values.message}`;
    if (digits) {
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } else if (email) {
      window.open(
        `mailto:${email}?subject=${encodeURIComponent(`Message from ${values.name}`)}&body=${encodeURIComponent(text)}`,
        "_self"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-[26px_26px_6px_26px] border border-border bg-card p-6"
    >
      <h3 className="font-heading text-xl font-bold tracking-wide uppercase">Send a message</h3>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={!canSend} className="h-11">
        {digits ? <MessageCircle className="size-4" /> : <Send className="size-4" />}
        {digits ? "Continue in WhatsApp" : "Continue in email"}
      </Button>
      <p className="text-xs text-muted-foreground">
        {canSend
          ? "This opens your own app with the message ready. Press send there to deliver it."
          : "Contact details have not been set up yet."}
      </p>
    </form>
  );
}
