import { CheckIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/api/types";
import { THEME_FONT_FAMILY } from "@/lib/theme-font-family";
import { cn } from "@/lib/utils";

/**
 * A small picture of a theme, drawn with inline styles from its tokens: the announcement band, the
 * page colours with "Aa" in the heading font, accent and sale dots, a primary button with the theme's
 * corner radius and button style, and the footer band.
 */
export function ThemeThumbnail({ theme }: { theme: Theme }) {
  const c = theme.colors;
  const buttonCase: CSSProperties = theme.buttons.uppercase ? { textTransform: "uppercase", letterSpacing: "0.08em" } : {};
  const button: CSSProperties = {
    ...buttonCase,
    borderRadius: `${theme.radius}rem`,
    border: `1px solid ${c.primary}`,
    ...(theme.buttons.style === "solid" ? { background: c.primary, color: c.primaryForeground } : { color: c.primary }),
  };

  return (
    <span aria-hidden className="flex h-20 flex-col overflow-hidden rounded-md border" style={{ background: c.background, color: c.foreground }}>
      <span className="h-2 shrink-0" style={{ background: c.announcement }} />
      <span className="flex flex-1 items-center gap-3 px-3">
        <span className="text-2xl leading-none" style={{ fontFamily: THEME_FONT_FAMILY[theme.fonts.heading] }}>
          Aa
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: c.accent }} />
          <span className="size-3 rounded-full" style={{ background: c.sale }} />
          <span className="flex h-6 items-center px-2.5 text-[10px] font-medium" style={button}>
            Shop
          </span>
        </span>
      </span>
      <span className="h-2 shrink-0" style={{ background: c.footer }} />
    </span>
  );
}

/** One choice in a theme picker. Put it inside an element with role="radiogroup". */
export function ThemeOption({
  selected,
  onSelect,
  title,
  description,
  preview,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  /** Usually a <ThemeThumbnail>. */
  preview: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      {preview}
      <span className="grid gap-0.5">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {title}
          {selected && <CheckIcon aria-hidden className="size-4" />}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
