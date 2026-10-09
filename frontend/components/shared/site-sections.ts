// The editable sections of the landing page, in the order they appear on the
// page. `id` matches the key in SiteContent, so it doubles as the form-error key.

export type SectionId =
  | "hero"
  | "ticker"
  | "about"
  | "activities"
  | "benefits"
  | "contact"
  | "join_cta";

export type SiteSection = {
  id: SectionId;
  /** Plain-language name shown to admins. */
  label: string;
  /** Where it sits on the public page. */
  where: string;
  hint: string;
};

export const SITE_SECTIONS: SiteSection[] = [
  {
    id: "hero",
    label: "Banner",
    where: "Top of the page",
    hint: "The big headline, intro text and photo visitors see first.",
  },
  {
    id: "ticker",
    label: "Scrolling strip",
    where: "Right under the banner",
    hint: "Short words that scroll across the page.",
  },
  {
    id: "about",
    label: "About",
    where: "Below the strip",
    hint: "Who the club is: the story, key points and photos.",
  },
  {
    id: "activities",
    label: "Activities",
    where: "Below About",
    hint: "The icons showing what the club does.",
  },
  {
    id: "benefits",
    label: "Benefits",
    where: "Middle of the page",
    hint: "Why people should join.",
  },
  {
    id: "contact",
    label: "Contact",
    where: "Near the bottom",
    hint: "Address, phone and email.",
  },
  {
    id: "join_cta",
    label: "Join banner",
    where: "Bottom of the page",
    hint: "The final call to action. Only shown to visitors who are not signed in.",
  },
];

export function sectionIndex(id: SectionId): number {
  return SITE_SECTIONS.findIndex((s) => s.id === id);
}
