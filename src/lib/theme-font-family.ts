import type { ThemeFont } from "@/lib/api/types";

/** CSS font-family for each theme font: the variables declared by src/lib/theme-fonts.ts (same names as the storefront's). */
export const THEME_FONT_FAMILY: Record<ThemeFont, string> = {
  jost: "var(--font-jost)",
  "cormorant-garamond": "var(--font-cormorant-garamond)",
  "playfair-display": "var(--font-playfair-display)",
  "nunito-sans": "var(--font-nunito-sans)",
  poppins: "var(--font-poppins)",
};
