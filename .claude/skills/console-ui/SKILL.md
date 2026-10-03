---
name: console-ui
description: Minimal design system for The Scent System superadmin console: tokens, page anatomy, status badges, tables, forms, confirmations. Use when building or changing any superadmin page or component.
---

# Superadmin console UI

**Minimal, neutral and dense.** The console is a tool for one operator: clarity and speed over decoration. It uses stock shadcn/ui (Radix, `radix-nova` style, **neutral** base colour) with light and dark mode. Don't add a brand palette, gradients, illustrations or custom fonts.

## Tokens

The shadcn neutral tokens in `src/app/globals.css` (`:root` and `.dark`) are the whole palette.

| Use | Classes |
| --- | --- |
| Page / surfaces | `bg-background`, `bg-card`, `bg-muted/40` for subtle wells |
| Text | `text-foreground`, `text-muted-foreground` for descriptions and meta |
| Primary action (one per view) | `<Button>` (default variant) |
| Secondary actions | `<Button variant="outline">` / `"ghost"` |
| Destructive | `<Button variant="destructive">`, always behind a confirm dialog |
| Borders | `border` (default colour), `border-dashed` for empty states |

**Typography:**
- Geist (`font-sans`); Geist Mono (`font-mono`) for IDs, slugs, SKUs and schema names.
- Page title: `text-2xl font-semibold tracking-tight`.
- Section or card title: `text-base font-semibold` or `CardTitle`.
- Body: `text-sm`. Never larger than `text-2xl`, except KPI values (`text-2xl tabular-nums`).

**Spacing and density:**
- Page padding `p-4 md:p-6`; `gap-6` between page sections, `gap-4` inside cards and grids.
- Tables use the default shadcn density.

**Radius:** the shadcn default (`--radius`); only `rounded-md` / `rounded-lg` via components.

## Page anatomy

```
<PageHeader title="Tenants" description="Every store on the platform." actions={<Button>New tenant</Button>} />
[filters row: search input, status select]   ← optional, above the table
<Card> or <Table> or <Tabs>                    ← the content
<EmptyState icon title description />          ← when there's nothing to show
```

- **Detail pages** (e.g. `/tenants/[id]`):
  - The header shows name + status badge, with primary actions on the right (Suspend / Reactivate).
  - Then `Tabs`: Overview, Subscription & payments, Feature flags, Theme, Content.
- **KPI rows:** `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` of `Card`s with `CardDescription` (label) and `CardTitle` (value).

## Status badges

One mapping, used everywhere (put it in a shared `StatusBadge` component when first needed):

| Status | Badge |
| --- | --- |
| Tenant `ACTIVE`, payment `CONFIRMED` | default (solid) |
| Tenant `SETUP`, `PROVISIONING`, payment `SUBMITTED` | `secondary` |
| Tenant `PAST_DUE` | `outline`, label "Past due · n days" |
| Tenant `SUSPENDED`, payment `REJECTED` | `destructive` |

Text always says the status; colour is never the only signal.

## Tables

- shadcn `Table`.
- **The first column identifies the row** and links to its detail page (e.g. tenant name + domain underneath in `text-muted-foreground`).
- **Numbers and money** are right-aligned with `tabular-nums`. Dates use the short format (e.g. "1 Oct 2026"), with relative time in a tooltip when useful.
- **Row actions** go in a trailing `DropdownMenu` (`MoreHorizontalIcon` button with `aria-label`).
- **Filters, sort and page** live in the URL (`searchParams`), so views are shareable and survive reloads.

## Forms

- `Label` + `Input` / `Select` / `Textarea`, validated with Zod 4.
- **API errors:** map `error.details[].path` to field errors; show `error.message` in a toast or alert.
- **Money inputs** show "Rs" as a prefix, accept rupees, and are converted to minor units (×100) before sending.
- **Submit buttons** show a pending state and disable while submitting.

## Confirmations

Use a dialog for every destructive or financial action: suspend, change price or plan, confirm or reject payment, delete. The body states exactly what happens and to whom, and the confirm button repeats the verb:

> **Suspend Acme Perfumes?** acme.com will show "temporarily unavailable" immediately, and the owner will be emailed. Reactivate any time.  [Cancel] [Suspend]

## Don'ts

- No colours outside the tokens, no custom fonts, no decorative imagery.
- No more than one primary button per view.
- Don't hide information behind hover only; touch and keyboard must reach everything.
- Don't build tenant-facing styling here: storefront themes are edited as data (preset + tokens) and previewed in the storefront.
