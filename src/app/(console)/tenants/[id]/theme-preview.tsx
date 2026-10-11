import { HeartIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { Theme } from "@/lib/api/types";
import { THEME_FONT_FAMILY } from "@/lib/theme-font-family";

const SAMPLE_PRODUCTS = [
  { brand: "Lattafa", name: "Midnight Oud", price: "Rs 12,900" },
  { brand: "Armaf", name: "Velvet Rose", price: "Rs 9,900", sale: "Rs 11,500" },
  { brand: "Afnan", name: "Citrus Coast", price: "Rs 11,900" },
];

/**
 * A miniature storefront rendered from theme tokens, for the theme editor. Uses inline styles so it
 * never touches the console's own tokens. It approximates the storefront; the real one is the reference.
 */
export function ThemePreview({ theme, storeName }: { theme: Theme; storeName: string }) {
  const c = theme.colors;
  const radius = `${theme.radius}rem`;
  const heading = THEME_FONT_FAMILY[theme.fonts.heading];
  const body = THEME_FONT_FAMILY[theme.fonts.body];

  const buttonCase: CSSProperties = theme.buttons.uppercase ? { textTransform: "uppercase", letterSpacing: "0.08em" } : {};
  const primaryButton: CSSProperties = {
    ...buttonCase,
    borderRadius: radius,
    border: `1px solid ${c.primary}`,
    ...(theme.buttons.style === "solid"
      ? { background: c.primary, color: c.primaryForeground }
      : { background: "transparent", color: c.primary }),
  };

  return (
    <div
      className="overflow-hidden rounded-lg border text-sm shadow-sm"
      style={{ background: c.background, color: c.foreground, fontFamily: body }}
      aria-label="Theme preview"
    >
      <div className="px-3 py-1.5 text-center text-[11px]" style={{ background: c.announcement, color: c.announcementForeground }}>
        Delivery all over Pakistan · 100% original perfumes
      </div>

      <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        <span className="text-lg font-semibold" style={{ fontFamily: heading }}>
          {storeName}
        </span>
        <nav className="ml-auto hidden gap-3 text-xs sm:flex">
          <span>Men</span>
          <span>Women</span>
          <span>Decants</span>
          <span style={{ color: c.sale }}>Sale</span>
        </nav>
        <span className="ml-auto flex gap-2 sm:ml-0">
          <SearchIcon className="size-4" />
          <HeartIcon className="size-4" />
          <ShoppingBagIcon className="size-4" />
        </span>
      </div>

      <div className="space-y-2 px-4 py-6" style={{ background: c.muted }}>
        <p className="text-2xl leading-tight font-semibold" style={{ fontFamily: heading }}>
          She Wore Summer.
        </p>
        <p style={{ color: c.mutedForeground }}>Light florals and fruity scents for her.</p>
        <button type="button" className="px-4 py-2 text-xs font-medium" style={primaryButton}>
          Shop now
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        {SAMPLE_PRODUCTS.map((product) => (
          <div key={product.name} className="space-y-1.5">
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: theme.productCard.imageAspect === "portrait" ? "3 / 4" : "1 / 1",
                borderRadius: radius,
                background: `linear-gradient(135deg, ${c.muted}, ${c.accent})`,
              }}
            >
              {product.sale && (
                <span
                  className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px]"
                  style={{ background: c.sale, color: c.saleForeground, borderRadius: radius }}
                >
                  Sale
                </span>
              )}
            </div>
            {theme.productCard.showBrand && (
              <p className="text-[10px] tracking-wider uppercase" style={{ color: c.mutedForeground }}>
                {product.brand}
              </p>
            )}
            <p className="text-xs font-medium">{product.name}</p>
            <p className="text-xs font-semibold">
              {product.sale ? (
                <>
                  <span style={{ color: c.sale }}>{product.price}</span>{" "}
                  <span className="font-normal line-through" style={{ color: c.mutedForeground }}>
                    {product.sale}
                  </span>
                </>
              ) : (
                product.price
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
        <button type="button" className="px-3 py-1.5 text-xs font-medium" style={primaryButton}>
          Add to cart
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium"
          style={{ ...buttonCase, borderRadius: radius, background: c.secondary, color: c.secondaryForeground }}
        >
          Wishlist
        </button>
        <span
          className="px-3 py-1.5 text-xs"
          style={{ borderRadius: radius, border: `1px solid ${c.border}`, outline: `2px solid ${c.ring}`, outlineOffset: 1 }}
        >
          Focused input
        </span>
        <span className="text-xs" style={{ color: c.accent }}>
          Accent link
        </span>
      </div>

      <div className="px-4 py-3 text-xs" style={{ background: c.footer, color: c.footerForeground }}>
        © {storeName} · About · Shipping · Returns
      </div>
    </div>
  );
}
