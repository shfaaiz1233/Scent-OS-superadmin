"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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

// "primaryForeground" → "Primary foreground"
const labelFor = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);

function ColorField({ name, value, onChange }: { name: ColorKey; value: string; onChange: (value: string) => void }) {
  // Text being typed (null when not editing); the field shows it, else the current value.
  const [typing, setTyping] = useState<string | null>(null);
  const draft = typing ?? value;
  const id = `color-${name}`;

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
          className="h-8 font-mono text-xs"
        />
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

/** Edit a store's theme: start from a preset, adjust tokens, preview live, save. */
export function ThemeEditor({ tenantId, savedTheme, presets }: { tenantId: string; savedTheme: Theme; presets: ThemePreset[] }) {
  const [theme, setTheme] = useState<Theme>(savedTheme);
  const [saving, startSave] = useTransition();
  const dirty = JSON.stringify(theme) !== JSON.stringify(savedTheme);
  const presetName = presets.find((p) => p.key === theme.preset)?.name ?? theme.preset;

  const setColor = (key: ColorKey, value: string) => setTheme((t) => ({ ...t, colors: { ...t.colors, [key]: value } }));

  function save() {
    startSave(async () => {
      const result = await saveThemeAction(tenantId, theme);
      if (result.ok) toast.success("Theme saved. New page loads use it now; open tabs within 20 minutes.");
      else toast.error(result.error);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preset</CardTitle>
            <CardDescription>Choosing a preset replaces every token below with the preset&apos;s values.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectField
              label="Start from"
              value={theme.preset}
              options={presets.map((p) => ({ value: p.key, label: p.name }))}
              onChange={(key) => {
                const preset = presets.find((p) => p.key === key);
                if (preset) setTheme(structuredClone(preset.theme));
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colours</CardTitle>
            <CardDescription>Keep text readable: each foreground colour sits on the colour above it.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {COLOR_GROUPS.map((group) => (
              <fieldset key={group.title} className="grid gap-3">
                <legend className="mb-1 text-sm font-medium">{group.title}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.keys.map((key) => (
                    <ColorField key={key} name={key} value={theme.colors[key]} onChange={(v) => setColor(key, v)} />
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
                  if (radius >= 0 && radius <= 2) setTheme((t) => ({ ...t, radius }));
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
              onChange={(motion) => setTheme((t) => ({ ...t, motion }))}
            />
            <SelectField
              label="Heading font"
              value={theme.fonts.heading}
              options={FONTS}
              onChange={(heading) => setTheme((t) => ({ ...t, fonts: { ...t.fonts, heading } }))}
            />
            <SelectField
              label="Body font"
              value={theme.fonts.body}
              options={FONTS}
              onChange={(body) => setTheme((t) => ({ ...t, fonts: { ...t.fonts, body } }))}
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
              onChange={(imageAspect) => setTheme((t) => ({ ...t, productCard: { ...t.productCard, imageAspect } }))}
            />
            <SelectField
              label="Image on hover"
              value={theme.productCard.hover}
              options={[
                { value: "none", label: "Nothing" },
                { value: "zoom", label: "Zoom" },
                { value: "swap", label: "Show second image" },
              ]}
              onChange={(hover) => setTheme((t) => ({ ...t, productCard: { ...t.productCard, hover } }))}
            />
            <SelectField
              label="Button style"
              value={theme.buttons.style}
              options={[
                { value: "solid", label: "Solid" },
                { value: "outline", label: "Outline" },
              ]}
              onChange={(style) => setTheme((t) => ({ ...t, buttons: { ...t.buttons, style } }))}
            />
            <div className="grid content-end gap-3">
              <SwitchField
                id="show-brand"
                label="Show brand on cards"
                checked={theme.productCard.showBrand}
                onChange={(showBrand) => setTheme((t) => ({ ...t, productCard: { ...t.productCard, showBrand } }))}
              />
              <SwitchField
                id="uppercase-buttons"
                label="Uppercase buttons"
                checked={theme.buttons.uppercase}
                onChange={(uppercase) => setTheme((t) => ({ ...t, buttons: { ...t.buttons, uppercase } }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-3 xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Preview · based on <span className="font-medium text-foreground">{presetName}</span>
            {dirty && " · unsaved changes"}
          </p>
        </div>
        <ThemePreview theme={theme} storeName="Your Store" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={!dirty || saving} onClick={() => setTheme(savedTheme)}>
            Discard changes
          </Button>
          <Button disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving…" : "Save theme"}
          </Button>
        </div>
      </div>
    </div>
  );
}
