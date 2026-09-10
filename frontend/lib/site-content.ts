// Editable content for the public landing page. One JSON document, served by
// GET /site-content and written by PUT /site-content (admin only). The backend
// stores it as a single jsonb row; until that endpoint exists the GET 404s and
// callers fall back to `defaultSiteContent` below, so the page keeps rendering
// exactly what it did when everything was hardcoded.

export const SITE_ICON_KEYS = [
  "Users",
  "Gauge",
  "HeartHandshake",
  "Moon",
  "Route",
  "Wrench",
  "CalendarDays",
  "ShieldCheck",
  "Heart",
  "Star",
  "Trophy",
  "MapPin",
] as const;

export type SiteIconKey = (typeof SITE_ICON_KEYS)[number];

export type SiteActivity = { icon: SiteIconKey; title: string };
export type SiteBenefit = {
  id: string;
  icon: SiteIconKey;
  title: string;
  description: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    /** 1-2 lines; the word matching `highlight` is drawn in the accent colour. */
    headline_lines: string[];
    highlight: string;
    body: string;
    value_props: string[];
    /** Uploaded image URL; "" renders the placeholder box. */
    image: string;
  };
  ticker: string[];
  about: {
    eyebrow: string;
    heading: string;
    body: string;
    established_year: string;
    points: string[];
    /** Up to 2 uploaded image URLs; missing slots render placeholders. */
    images: string[];
  };
  activities: {
    eyebrow: string;
    heading: string;
    items: SiteActivity[];
  };
  benefits: {
    eyebrow: string;
    heading: string;
    items: SiteBenefit[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    address: string;
    phone: string;
    email: string;
  };
  join_cta: {
    heading: string;
    body: string;
  };
};

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: "Est. Brotherhood of Riders",
    headline_lines: ["Ride Together.", "Stay Family."],
    highlight: "Family",
    body:
      "A community of riders sharing the road, the events, and the brotherhood. Join the club and be part of every ride.",
    value_props: ["Ride together every weekend", "Family that has your back"],
    image: "",
  },
  ticker: [
    "GROUP RIDES",
    "TRACK DAYS",
    "CHARITY RUNS",
    "NIGHT RIDES",
    "TOURING",
    "MAINTENANCE CLINICS",
  ],
  about: {
    eyebrow: "Who We Are",
    heading: "About the Club",
    body:
      "Founded by riders for riders, our club brings together people who share a passion for the open road. From weekend rides to charity runs, we build lasting friendships one mile at a time.",
    established_year: "2024",
    points: [
      "Founded by riders, for riders - not a business, a brotherhood.",
      "Weekend rides, charity runs, and yearly gatherings that keep the club close.",
      "Safety, respect for the road, and giving back to every community we pass through.",
    ],
    images: [],
  },
  activities: {
    eyebrow: "What We Do",
    heading: "Club Activities",
    items: [
      { icon: "Users", title: "Group Rides" },
      { icon: "Gauge", title: "Track Days" },
      { icon: "HeartHandshake", title: "Charity Runs" },
      { icon: "Moon", title: "Night Rides" },
      { icon: "Route", title: "Touring" },
      { icon: "Wrench", title: "Maintenance Clinics" },
    ],
  },
  benefits: {
    eyebrow: "Why Join",
    heading: "Ready to Ride With Us?",
    items: [
      {
        id: "1",
        icon: "Users",
        title: "Community",
        description:
          "A brotherhood of riders who look out for each other on and off the road.",
      },
      {
        id: "2",
        icon: "CalendarDays",
        title: "Exclusive Events",
        description: "Members-only rides, meetups, and annual gatherings.",
      },
      {
        id: "3",
        icon: "ShieldCheck",
        title: "Rider Support",
        description:
          "Roadside assistance network and safety resources for members.",
      },
      {
        id: "4",
        icon: "Wrench",
        title: "Workshops",
        description: "Maintenance clinics and gear discounts from partner shops.",
      },
    ],
  },
  contact: {
    eyebrow: "Get In Touch",
    heading: "Contact Us",
    address: "Club HQ, 123 Rider Street",
    phone: "+62 812-0000-0000",
    email: "hello@motorcycleclub.example",
  },
  join_cta: {
    heading: "Ready to Ride With Us?",
    body: "Apply for membership today and join the next chapter of our club.",
  },
};

/**
 * Merge a payload from the API over the defaults, section by section, so a
 * backend that stored an older shape (missing a field added later) never leaves
 * a section half-rendered.
 */
export function withSiteContentDefaults(
  c: Partial<SiteContent> | null | undefined
): SiteContent {
  if (!c) return defaultSiteContent;
  const d = defaultSiteContent;
  return {
    hero: { ...d.hero, ...c.hero },
    ticker: c.ticker ?? d.ticker,
    about: { ...d.about, ...c.about },
    activities: { ...d.activities, ...c.activities },
    benefits: { ...d.benefits, ...c.benefits },
    contact: { ...d.contact, ...c.contact },
    join_cta: { ...d.join_cta, ...c.join_cta },
  };
}
