"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FormField } from "@/components/form-field";
import { ThemeOption, ThemeThumbnail } from "@/components/theme-option";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ThemePreset } from "@/lib/api/types";
import { createTenantAction } from "../actions";

// Slug rules match the API: 2–30 lowercase letters, digits or underscores, starting with a letter.
function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+/, "")
    .replace(/_+$/, "")
    .slice(0, 30);
}

export function NewTenantForm({ presets }: { presets: ThemePreset[] }) {
  const [state, formAction, pending] = useActionState(createTenantAction, null);
  const failed = state && !state.ok ? state : null;
  const errors = failed?.fieldErrors ?? {};
  const values = failed?.values ?? {};

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [preset, setPreset] = useState(presets[0]?.key ?? "palette");

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
          <CardDescription>The slug is permanent: it names the store&apos;s database schema.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="name" label="Store name" error={errors.name}>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugFromName(e.target.value));
              }}
              placeholder="Acme Perfumes"
            />
          </FormField>
          <FormField id="slug" label="Slug" hint="Lowercase letters, digits and _ (e.g. acme)" error={errors.slug}>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              className="font-mono"
              placeholder="acme"
            />
          </FormField>
          <FormField
            id="domains"
            label="Domains"
            hint="One per line, without https://. The first becomes the primary domain; you can change it later."
            error={errors.domains}
          >
            <Textarea id="domains" name="domains" required rows={3} className="font-mono" placeholder={"acme.com\nwww.acme.com"} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner</CardTitle>
          <CardDescription>Who you bill and contact. They get the store&apos;s owner login.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="ownerName" label="Name" error={errors.ownerName}>
            <Input id="ownerName" name="ownerName" required autoComplete="off" defaultValue={values.ownerName} />
          </FormField>
          <FormField id="ownerEmail" label="Email" error={errors.ownerEmail}>
            <Input id="ownerEmail" name="ownerEmail" type="email" required autoComplete="off" defaultValue={values.ownerEmail} />
          </FormField>
          <FormField id="ownerPhone" label="Phone" hint="e.g. +92 300 1234567" error={errors.ownerPhone}>
            <Input id="ownerPhone" name="ownerPhone" type="tel" required autoComplete="off" defaultValue={values.ownerPhone} />
          </FormField>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Starting look for the storefront. You can fine-tune every token later.</CardDescription>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="themePreset" value={preset} />
          <div role="radiogroup" aria-label="Theme preset" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {presets.map((p) => (
              <ThemeOption
                key={p.key}
                selected={preset === p.key}
                onSelect={() => setPreset(p.key)}
                title={p.name}
                description={p.description}
                preview={<ThemeThumbnail theme={p.theme} />}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 lg:col-span-2">
        {failed && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {failed.error}
          </p>
        )}
        <Button variant="outline" asChild>
          <Link href="/tenants">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create tenant"}
        </Button>
      </div>
    </form>
  );
}
