// TODO: There is no backend table/endpoint for membership benefits yet.
// Persisted to localStorage for now so admin changes actually stick across
// reloads; replace with real GET/POST/PUT/DELETE calls once one exists.

export const BENEFIT_ICON_KEYS = [
  "Users",
  "CalendarDays",
  "ShieldCheck",
  "Wrench",
  "Heart",
  "Star",
  "Trophy",
  "MapPin",
] as const;

export type BenefitIconKey = (typeof BENEFIT_ICON_KEYS)[number];

export type Benefit = {
  id: string;
  icon: BenefitIconKey;
  title: string;
  description: string;
};

const STORAGE_KEY = "moto-club-benefits";
const EVENT_NAME = "moto-club-benefits-changed";

const defaultBenefits: Benefit[] = [
  {
    id: "1",
    icon: "Users",
    title: "Community",
    description: "A brotherhood of riders who look out for each other on and off the road.",
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
    description: "Roadside assistance network and safety resources for members.",
  },
  {
    id: "4",
    icon: "Wrench",
    title: "Workshops",
    description: "Maintenance clinics and gear discounts from partner shops.",
  },
];

export function getBenefits(): Benefit[] {
  if (typeof window === "undefined") return defaultBenefits;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultBenefits;
  try {
    return JSON.parse(raw) as Benefit[];
  } catch {
    return defaultBenefits;
  }
}

function save(benefits: Benefit[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(benefits));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function createBenefit(input: Omit<Benefit, "id">): void {
  save([...getBenefits(), { ...input, id: crypto.randomUUID() }]);
}

export function updateBenefit(id: string, input: Omit<Benefit, "id">): void {
  save(getBenefits().map((b) => (b.id === id ? { ...input, id } : b)));
}

export function deleteBenefit(id: string): void {
  save(getBenefits().filter((b) => b.id !== id));
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}
