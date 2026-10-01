@AGENTS.md

# CLAUDE.md: Scent-OS superadmin

The platform owner's console: onboard tenants (which provisions their database schema), set their theme, content and feature flags, manage plans and per-tenant pricing, confirm subscription payments, suspend or reactivate stores, and see ledgers and analytics. One user today (the owner), built so more superadmins can be added.

- System design (what we build and why): `../Scent-OS/docs/system-design.md`, especially §5 (flows), §6 (tenant status) and §9 (this app). Read the relevant part before building a feature.
- API: `../Scent-OS` (OpenAPI docs at `http://localhost:6001/docs`). Superadmin endpoints live under `/api/superadmin/*` (Phase 1+).
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix, `radix-nova` style, neutral base), next-themes (light/dark), lucide-react, pnpm.
- **Design: minimal.** Neutral shadcn look, dense and functional. See the skill `console-ui`.

## Commands

| Command          | Use                                                                         |
| ---------------- | --------------------------------------------------------------------------- |
| `pnpm dev`       | Dev server on **:3001** (the storefront uses :3000, the API :6001)           |
| `pnpm build` / `pnpm start` | Production build / server (:3001)                                |
| `pnpm typecheck` | `next typegen` + `tsc`. **Must pass after every change**                     |
| `pnpm lint`      | ESLint. **Must pass**                                                        |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from the running API's OpenAPI document |

pnpm only: never npm or npx. Add UI with `pnpm dlx shadcn@latest add <component>`.

## Architecture rules

- **The browser never calls the API (BFF):**
  - Server Components, route handlers and server actions call the API with `API_URL`.
  - The superadmin session (Phase 1) is an `httpOnly` cookie set by this app, forwarded to the API as `Authorization: Bearer`.
  - Modules that call the API start with `import "server-only"`.
- **API types are generated** (`pnpm api:types` → `src/lib/api/schema.d.ts`), never hand-written. Commit the regenerated file with API changes.
- **Every page sits behind auth** once Phase 1 lands: `(console)` routes require a superadmin session; `/login` is the only public page.
- **Destructive or money-related actions need explicit confirmation:** suspend, change price, confirm or reject payment, delete. Use a confirm dialog that states the effect ("Suspends acme.com immediately; the storefront shows 'temporarily unavailable'").
- **Money:** integer minor units (paisa) from the API. Format with one shared helper, and parse user input into minor units before sending.
- Next.js 16: `headers()`, `cookies()`, `params` and `searchParams` are async; `revalidateTag` takes a second argument; `middleware` is `proxy`. Read `node_modules/next/dist/docs/` before using an unfamiliar API.

## Layout

```
src/
├── app/
│   ├── layout.tsx              Root: fonts (Geist), Providers (next-themes, tooltips, toasts)
│   ├── globals.css             shadcn neutral tokens (light + .dark)
│   ├── login/                  Sign-in (public)
│   └── (console)/              Signed-in console: sidebar + top bar
│       ├── page.tsx            Overview (KPIs)
│       ├── tenants/            List, create, detail (tabs: overview, subscription, flags, theme, content)
│       ├── plans/  payments/  ledger/  settings/
├── components/
│   ├── ui/                     shadcn/ui, generated; don't hand-edit
│   ├── app-sidebar.tsx         Navigation (items in lib/navigation.ts)
│   ├── page-header.tsx         Title + description + actions, at the top of every page
│   ├── empty-state.tsx         No data yet / not built yet
│   ├── providers.tsx, theme-toggle.tsx
└── lib/
    ├── navigation.ts           Sidebar items
    ├── api/                    schema.d.ts (generated); server-side client (Phase 1)
    └── utils.ts                cn()
```

## Conventions

- **Server Components by default;** `"use client"` only for interactivity. Data is fetched in Server Components; mutations go through server actions that call the API and then `revalidatePath` / `refresh()`.
- **Every page** starts with `<PageHeader title description actions />`, then content in cards, tables or tabs. A list with no rows shows `<EmptyState>`.
- **Styling:**
  - shadcn tokens only (`bg-background`, `text-muted-foreground`, `bg-primary`, `border`…); no raw colours.
  - Status colours come from the badge mapping in the `console-ui` skill.
  - Both light and dark mode must work.
- **Forms:** shadcn `Field`/`Label`/`Input`, validated with Zod 4. Show the API's `error.details` next to the matching fields.
- **Tables:** shadcn `Table`, server-side pagination and filters via `searchParams`. Numbers and money are right-aligned with `tabular-nums`.
- **Feedback:** `toast` (sonner) after mutations; inline errors for validation.

## Verifying changes

1. Run `pnpm typecheck` and `pnpm lint`.
2. Run `pnpm dev` and check the page in light and dark mode, plus a narrow window (sidebar collapses to a sheet).
3. For anything that changes a tenant, check the effect in the storefront too: open `http://<store>.localhost:3000`.
4. Stop every dev server you started, by port.
