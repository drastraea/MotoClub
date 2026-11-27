// The site accent colour, chosen by an admin. "" means the default club grey
// defined in globals.css. Any chosen colour is nudged lighter or darker per
// surface so text in it stays readable (WCAG 4.5:1).

export type AccentColors = {
  /** For white surfaces (light mode). */
  light: string;
  lightText: string;
  /** For dark surfaces (dark mode, hero, member card). */
  dark: string;
  darkText: string;
};

export const CLUB_GREY = "#bdbec0";

// Mirrors the --primary values in globals.css.
const DEFAULT_COLORS: AccentColors = {
  light: "#4e5156",
  lightText: "#ffffff",
  dark: CLUB_GREY,
  darkText: "#000000",
};

export const ACCENT_PRESETS = [
  { value: "", label: "Club grey (default)" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#a855f7", label: "Purple" },
];

export function isAccent(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Moves `hex` toward `target` just far enough to be readable on `surface`. */
function readableOn(hex: string, surface: string, target: string): string {
  const from = rgb(hex);
  const to = rgb(target);
  for (let step = 0; step <= 25; step++) {
    const mixed =
      "#" +
      from
        .map((v, i) => Math.round(v + ((to[i] - v) * step) / 25).toString(16).padStart(2, "0"))
        .join("");
    if (contrast(mixed, surface) >= 4.5) return mixed;
  }
  return target;
}

const textOn = (bg: string) =>
  contrast(bg, "#ffffff") >= contrast(bg, "#000000") ? "#ffffff" : "#000000";

export function accentColors(accent: unknown): AccentColors {
  if (!isAccent(accent)) return DEFAULT_COLORS;
  const light = readableOn(accent, "#ffffff", "#000000");
  const dark = readableOn(accent, "#171717", "#ffffff");
  return { light, lightText: textOn(light), dark, darkText: textOn(dark) };
}

/** CSS that overrides the accent variables, or "" to keep the default. */
export function accentCss(accent: unknown): string {
  if (!isAccent(accent)) return "";
  const c = accentColors(accent);
  const vars = (color: string, text: string) =>
    ["primary", "sidebar-primary"]
      .map((n) => `--${n}:${color};--${n}-foreground:${text};`)
      .join("") + `--ring:${color};--sidebar-ring:${color};--chart-1:${color};`;
  // The extra `html` makes these win over globals.css whatever the load order.
  return [
    `html:root{${vars(c.light, c.lightText)}}`,
    `html.dark{${vars(c.dark, c.darkText)}}`,
    `html .on-dark{${vars(c.dark, c.darkText)}}`,
  ].join("");
}
