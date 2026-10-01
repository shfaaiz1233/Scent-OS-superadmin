"use client";

import { PaletteIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ThemeOption, ThemeThumbnail } from "@/components/theme-option";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Theme, ThemeFont, ThemePreset } from "@/lib/api/types";
import { saveThemeAction } from "../actions";
import { ThemePreview } from "./theme-preview";

type ColorKey = keyof Theme["colors"];

const COLOR_GROUPS: { title: string; keys: ColorKey[] }[] = [
  { title: "Page", keys: ["background", "foreground", "muted", "mutedForeground", "border", "ring"] },
  { title: "Actions", keys: ["primary", "primaryForeground", "secondary", "secondaryForeground", "accent", "accentForeground"] },
  { title: "Cards and sale", keys: ["card", "cardForeground", "sale", "saleForeground"] },
  { title: "Announcement bar and footer", keys: ["announcement", "announcementForeground", "footer", "footerForeground"] },
];

const FONTS: { value: ThemeFont; label: string }[] = [
  { value: "jost", label: "Jost (sans)" },
  { value: "poppins", label: "Poppins (sans)" },
  { value: "nunito-sans", label: "Nunito Sans (sans)" },
  { value: "cormorant-garamond", label: "Cormorant Garamond (serif)" },
  { value: "playfair-display", label: "Playfair Display (serif)" },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Text colour → the colour it's read on. Each pair should reach WCAG AA (4.5:1) for normal text. */
const CONTRAST_PAIRS: Partial<Record<ColorKey, ColorKey>> = {
  foreground: "background",
  mutedForeground: "background",
  cardForeground: "card",
  primaryForeground: "primary",
  secondaryForeground: "secondary",
  accentForeground: "accent",
  saleForeground: "sale",
  announcementForeground: "announcement",
  footerForeground: "footer",
};
const MIN_CONTRAST = 4.5;

// WCAG 2 relative luminance and contrast ratio of two #RRGGBB colours.
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Text colours that are hard to read on their background. */
function lowContrastPairs(colors: Theme["colors"]): ColorKey[] {
  return (Object.entries(CONTRAST_PAIRS) as [ColorKey, ColorKey][])
    .filter(([text, bg]) => contrastRatio(colors[text], colors[bg]) < MIN_CONTRAST)
    .map(([text]) => text);
}

// Themes compared by value: key order and hex letter case don't matter.
const canonical = (value: unknown) =>
  JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : typeof v === "string"
        ? v.toLowerCase()
        : v,
  );
const sameTheme = (a: Theme, b: Theme) => canonical(a) === canonical(b);

// "primaryForeground" → "Primary foreground"
const labelFor = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);

function ColorField({
  name,
  value,
  onChange,
  readOn,
}: {
  name: ColorKey;
  value: string;
  onChange: (value: string) => void;
  /** For text colours: the background colour it's read on, to warn about low contrast. */
  readOn?: { name: ColorKey; value: string };
}) {
  // Text being typed (null when not editing); the field shows it, else the current value.
  const [typing, setTyping] = useState<string | null>(null);
  const draft = typing ?? value;
  const id = `color-${name}`;
  const contrast = readOn ? contrastRatio(value, readOn.value) : null;

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${labelFor(name)} colour`}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border bg-transparent"
      />
      <div className="grid flex-1 gap-0.5">
        <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
          {labelFor(name)}
        </Label>
        <Input
          id={id}
          value={draft}
          onChange={(e) => {
            setTyping(e.target.value);
            if (HEX.test(e.target.value)) onChange(e.target.value.toUpperCase());
          }}
          onBlur={() => setTyping(null)}
          aria-invalid={!HEX.test(draft)}
          aria-describedby={contrast !== null && contrast < MIN_CONTRAST ? `${id}-contrast` : undefined}
          className="h-8 font-mono text-xs"
        />
        {readOn && contrast !== null && contrast < MIN_CONTRAST && (
          <p id={`${id}-contrast`} className="text-xs text-destructive">
            Hard to read on {labelFor(readOn.name).toLowerCase()}: {contrast.toFixed(1)}:1 (aim for {MIN_CONTRAST}:1)
          </p>
        )}
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger aria-label={label} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SwitchField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/**
 * Edit a store's theme: pick a preset or design a custom one, preview it live, save. The custom design
 * is kept while trying presets, so picking "Custom" again brings it back.
 */
export function ThemeEditor({ tenantId, savedTheme, presets }: { tenantId: string; savedTheme: Theme; presets: ThemePreset[] }) {
  const presetMatching = (t: Theme) => presets.find((p) => sameTheme(p.theme, t));
  const presetName = (key: string) => presets.find((p) => p.key === key)?.name ?? key;
  const [theme, setTheme] = useState<Theme>(savedTheme);
  const [customTheme, setCustomTheme] = useState<Theme | null>(() => (presetMatching(savedTheme) ? null : savedTheme));
  const [saving, startSave] = useTransition();
  const editorRef = useRef<HTMLDivElement>(null);

  const dirty = !sameTheme(theme, savedTheme);
  const selectedPreset = presetMatching(theme);
  const lowContrast = lowContrastPairs(theme.colors);

  /** Change tokens. The result is the custom design, unless it happens to equal a preset. */
  function edit(change: (t: Theme) => Theme) {
    const next = change(theme);
    setTheme(next);
    if (!presetMatching(next)) setCustomTheme(next);
  }
  const setColor = (key: ColorKey, value: string) => edit((t) => ({ ...t, colors: { ...t.colors, [key]: value } }));

  function chooseCustom() {
    if (customTheme) setTheme(customTheme);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    editorRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function discard() {
    setTheme(savedTheme);
    setCustomTheme(presetMatching(savedTheme) ? null : savedTheme);
  }

  function save() {
    startSave(async () => {
      const result = await saveThemeAction(tenantId, theme);
      if (result.ok) toast.success("Theme saved. New page loads use it now; open tabs within 20 minutes.");
      else toast.error(result.error);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Pick a ready-made theme, or choose Custom and design your own below. Your custom design is kept while you
              try the others.
            </CardDescription>
          </CardHeader>
          <CardContent className="@container">
            <div role="radiogroup" aria-label="Theme" className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-3">
              {presets.map((preset) => (
                <ThemeOption
                  key={preset.key}
                  selected={selectedPreset?.key === preset.key}
                  onSelect={() => setTheme(structuredClone(preset.theme))}
                  title={preset.name}
                  description={preset.description}
                  preview={<ThemeThumbnail theme={preset.theme} />}
                />
              ))}
              <ThemeOption
                selected={!selectedPreset}
                onSelect={chooseCustom}
                title="Custom"
                description={
                  customTheme
                    ? `Your own design, based on ${presetName(customTheme.preset)}.`
                    : "Design your own: start from the selected theme and change any colour, font or shape below."
                }
                preview={
                  customTheme ? (
                    <ThemeThumbnail theme={customTheme} />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-20 items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground"
                    >
                      <PaletteIcon className="size-4" /> Design your own
                    </span>
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card ref={editorRef} className="scroll-mt-6">
          <CardHeader>
            <CardTitle>Colours</CardTitle>
            <CardDescription>
              Keep text readable: each foreground colour sits on the colour beside it. Any change here makes the theme
              Custom.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {COLOR_GROUPS.map((group) => (
              <fieldset key={group.title} className="grid gap-3">
                <legend className="mb-1 text-sm font-medium">{group.title}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.keys.map((key) => (
                    <ColorField
                      key={key}
                      name={key}
                      value={theme.colors[key]}
                      onChange={(v) => setColor(key, v)}
                      readOn={CONTRAST_PAIRS[key] ? { name: CONTRAST_PAIRS[key], value: theme.colors[CONTRAST_PAIRS[key]] } : undefined}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shape, type and motion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="radius" className="text-xs font-normal text-muted-foreground">
                Corner radius (rem, 0–2)
              </Label>
              <Input
                id="radius"
                type="number"
                min={0}
                max={2}
                step={0.125}
                value={theme.radius}
                onChange={(e) => {
                  const radius = Number(e.target.value);
                  if (radius >= 0 && radius <= 2) edit((t) => ({ ...t, radius }));
                }}
              />
            </div>
            <SelectField
              label="Motion"
              value={theme.motion}
              options={[
                { value: "none", label: "None" },
                { value: "subtle", label: "Subtle" },
                { value: "lively", label: "Lively" },
              ]}
              onChange={(motion) => edit((t) => ({ ...t, motion }))}
            />
            <SelectField
              label="Heading font"
              value={theme.fonts.heading}
              options={FONTS}
              onChange={(heading) => edit((t) => ({ ...t, fonts: { ...t.fonts, heading } }))}
            />
            <SelectField
              label="Body font"
              value={theme.fonts.body}
              options={FONTS}
              onChange={(body) => edit((t) => ({ ...t, fonts: { ...t.fonts, body } }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product cards and buttons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Image shape"
              value={theme.productCard.imageAspect}
              options={[
                { value: "square", label: "Square" },
                { value: "portrait", label: "Portrait (3:4)" },
              ]}
              onChange={(imageAspect) => edit((t) => ({ ...t, productCard: { ...t.productCard, imageAspect } }))}
            />
            <SelectField
              label="Image on hover"
              value={theme.productCard.hover}
              options={[
                { value: "none", label: "Nothing" },
                { value: "zoom", label: "Zoom" },
                { value: "swap", label: "Show second image" },
              ]}
              onChange={(hover) => edit((t) => ({ ...t, productCard: { ...t.productCard, hover } }))}
            />
            <SelectField
              label="Button style"
              value={theme.buttons.style}
              options={[
                { value: "solid", label: "Solid" },
                { value: "outline", label: "Outline" },
              ]}
              onChange={(style) => edit((t) => ({ ...t, buttons: { ...t.buttons, style } }))}
            />
            <div className="grid content-end gap-3">
              <SwitchField
                id="show-brand"
                label="Show brand on cards"
                checked={theme.productCard.showBrand}
                onChange={(showBrand) => edit((t) => ({ ...t, productCard: { ...t.productCard, showBrand } }))}
              />
              <SwitchField
                id="uppercase-buttons"
                label="Uppercase buttons"
                checked={theme.buttons.uppercase}
                onChange={(uppercase) => edit((t) => ({ ...t, buttons: { ...t.buttons, uppercase } }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <aside aria-label="Preview and save" className="flex flex-col gap-3 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 text-sm text-muted-foreground">
            Preview ·{" "}
            <span className="font-medium text-foreground">
              {selectedPreset ? selectedPreset.name : `Custom, based on ${presetName(theme.preset)}`}
            </span>
            {dirty && " · unsaved"}
          </p>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button variant="outline" size="sm" disabled={!dirty || saving} onClick={discard}>
              Discard
            </Button>
            <Button size="sm" disabled={!dirty || saving} onClick={save}>
              {saving ? "Saving…" : "Save theme"}
            </Button>
          </div>
        </div>
        {lowContrast.length > 0 && (
          <p role="status" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {lowContrast.length === 1 ? "1 text colour is" : `${lowContrast.length} text colours are`} hard to read on
            its background ({lowContrast.map((key) => labelFor(key).toLowerCase()).join(", ")}). You can still save.
          </p>
        )}
        {/* Scrolls on its own if the preview is taller than the window. */}
        <div className="min-h-0 overflow-y-auto rounded-lg">
          <ThemePreview theme={theme} storeName="Your Store" />
        </div>
      </aside>
    </div>
  );
}
