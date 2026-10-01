import { Cormorant_Garamond, Jost, Nunito_Sans, Playfair_Display, Poppins } from "next/font/google";

// The storefront theme fonts, loaded here only for the theme editor's live preview. `preload: false`:
// browsers download one only when the preview uses it. Mirrors the storefront's src/lib/theme/fonts.ts.

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap", preload: false });
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
  display: "swap",
  preload: false,
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  preload: false,
});
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans", display: "swap", preload: false });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

/** Class names declaring every theme font variable; put on <html>. */
export const themeFontVariableClassNames = [jost, cormorantGaramond, playfairDisplay, nunitoSans, poppins]
  .map((font) => font.variable)
  .join(" ");
