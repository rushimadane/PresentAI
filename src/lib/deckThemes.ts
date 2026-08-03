// Deck themes and per-slide layouts for the in-app presentation viewer.

export type ThemeId = "light" | "dark" | "bold" | "warm";

export interface DeckTheme {
  id: ThemeId;
  name: string;
  // CSS values used directly in inline styles.
  bg: string;          // slide background
  panelBg: string;     // text panel background (for split layouts)
  text: string;        // primary text
  muted: string;       // secondary text
  accent: string;      // headings / bullets accent
  accentText: string;  // text on accent
  fontFamily: string;
  // A small swatch pair for the theme-picker chips.
  swatch: [string, string];
}

export const DECK_THEMES: Record<ThemeId, DeckTheme> = {
  light: {
    id: "light",
    name: "Light",
    bg: "#ffffff",
    panelBg: "#f8fafc",
    text: "#0f172a",
    muted: "#475569",
    accent: "#2563eb",
    accentText: "#ffffff",
    fontFamily: "'Inter', system-ui, sans-serif",
    swatch: ["#ffffff", "#2563eb"],
  },
  dark: {
    id: "dark",
    name: "Dark",
    bg: "#0f172a",
    panelBg: "#1e293b",
    text: "#f1f5f9",
    muted: "#94a3b8",
    accent: "#38bdf8",
    accentText: "#0f172a",
    fontFamily: "'Inter', system-ui, sans-serif",
    swatch: ["#0f172a", "#38bdf8"],
  },
  bold: {
    id: "bold",
    name: "Bold",
    bg: "#4c1d95",
    panelBg: "#5b21b6",
    text: "#ffffff",
    muted: "#ddd6fe",
    accent: "#fbbf24",
    accentText: "#3b0764",
    fontFamily: "'Inter', system-ui, sans-serif",
    swatch: ["#4c1d95", "#fbbf24"],
  },
  warm: {
    id: "warm",
    name: "Warm",
    bg: "#fdf6ec",
    panelBg: "#f8ead3",
    text: "#3a2a1a",
    muted: "#8a6d4f",
    accent: "#c2410c",
    accentText: "#ffffff",
    fontFamily: "'Inter', system-ui, sans-serif",
    swatch: ["#fdf6ec", "#c2410c"],
  },
};

export const THEME_LIST = Object.values(DECK_THEMES);
export const DEFAULT_THEME: ThemeId = "light";

// Per-slide layout variants.
export type SlideLayout =
  | "cover"        // big centered title (first slide)
  | "image-left"   // image left, text right
  | "image-right"  // text left, image right
  | "full-image"   // full-bleed image with overlaid text
  | "text-only";   // no image, centered text

// Deterministically assign a layout to each slide so a deck looks varied but
// stable across re-renders. First slide is always a cover; slides without an
// image become text-only; the rest alternate.
export const layoutForSlide = (index: number, total: number, hasImage: boolean): SlideLayout => {
  if (index === 0) return "cover";
  if (!hasImage) return "text-only";
  const cycle = index % 4;
  if (cycle === 1) return "image-right";
  if (cycle === 2) return "image-left";
  if (cycle === 3) return "full-image";
  return "image-right";
};
