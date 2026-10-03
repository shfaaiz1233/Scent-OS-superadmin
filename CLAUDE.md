@AGENTS.md

# CLAUDE.md: The Scent System superadmin console

The platform owner's console: onboard tenants (which provisions their database schema), set their theme, content and feature flags, manage plans and per-tenant pricing, confirm subscription payments, suspend or reactivate stores, and see ledgers and analytics. One user today (the owner), built so more superadmins can be added.

- System design (what we build and why): `../Scent-OS/docs/system-design.md`, especially §5 (flows), §6 (tenant status) and §9 (this app). Read the relevant part before building a feature.
- API: `../Scent-OS` (OpenAPI docs at `http://localhost:6001/docs`). Superadmin endpoints live under `/api/superadmin/*`.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix, `radix-nova` style, neutral base), next-themes (light/dark), lucide-react, pnpm.
- **Design: minimal.** Neutral shadcn look, dense and functional. See the skill `console-ui`.
- Deployed on Vercel at `app.thescentsystem.store` (`vercel.json`: framework Next.js, region `syd1`); setup and variables in `../Scent-OS/docs/deployment.md`. CI: `.github/workflows/ci.yml` (typecheck, lint).

## Commands

| Command          | Use                                                                         |
| ---------------- | --------------------------------------------------------------------------- |
| `pnpm dev`       | Dev server on **:3001** (the storefront uses :3000, the API :6001)           |
| `pnpm build` / `pnpm start` | Production build / server (:3001)                                |
| `pnpm typecheck` | `next typegen` + `tsc`. **Must pass after every change**                     |
| `pnpm lint`      | ESLint. **Must pass**                                                        |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from the running API's OpenAPI document |

pnpm only: never npm or npx. Add UI with `pnpm dlx shadcn@latest add <component>`.

- Env (`.env.local`, template `.env.example`): `API_URL`, and `API_BFF_SECRET` (= the API's `BFF_SECRET`). Both server-only: never prefix them with `NEXT_PUBLIC_`.
- Sign-in needs a superadmin account. Create one locally with `pnpm superadmin:create --email … --name …` in `../Scent-OS`; there's no sign-up.

## Architecture rules

- **The browser never calls the API (BFF):**
  - Server Components, route handlers and server actions call the API through `api()` in `src/lib/api/server.ts`, never with a bare `fetch`. Modules that call the API start with `import "server-only"`.
  - `api<T>(path, { method, body, auth = true })` unwraps `{ data }`, throws `ApiError` (`status`, `message`, `details`), sends the session as `Authorization: Bearer`, and forwards the browser's IP (`X-Client-IP` + `X-BFF-Secret`) for the API's sign-in rate limits. With `auth`, it redirects to `/login` when there's no session and to `/login?expired=1` when the API answers 401. Only the login action passes `auth: false`.
  - The session is the httpOnly cookie `sa_session` (`SESSION_COOKIE`), set by `loginAction` and cleared by `logoutAction` (`src/app/login/actions.ts`). The token never reaches client JavaScript.
- **API types are generated** (`pnpm api:types` → `src/lib/api/schema.d.ts`), never hand-written. Use the aliases in `src/lib/api/types.ts`. Commit the regenerated file with API changes.
- **Every page sits behind auth:** `(console)/layout.tsx` calls `getCurrentSuperAdmin()` (`src/lib/session.ts`, cached per request), which redirects when signed out. `/login` is the only public page.
- **Server actions** live next to their pages (`tenants/actions.ts`) and return `ActionResult` (`src/lib/action-result.ts`): `{ ok: true, data } | { ok: false, error, fieldErrors?, values? }`. Turn `ApiError`s into results with `toActionError(err, formValues(formData))`; anything else is rethrown. React 19 resets forms after an action, so failed actions echo `values` (never passwords) and inputs use them as `defaultValue`. After a change, `revalidatePath` the affected pages; call `redirect()` outside `try/catch`.
- **Destructive or money-related actions need explicit confirmation:** suspend, change price, confirm or reject payment, delete. Use a confirm dialog that states the effect ("Suspends acme.com immediately; the storefront shows 'temporarily unavailable'").
- **Money:** integer minor units (paisa) from the API. Format with one shared helper, and parse user input into minor units before sending.
- Next.js 16: `headers()`, `cookies()`, `params` and `searchParams` are async; `revalidateTag` takes a second argument; `middleware` is `proxy`. Read `node_modules/next/dist/docs/` before using an unfamiliar API.

## Layout

```
src/
├── app/
│   ├── layout.tsx              Root: fonts (Geist + the 5 store theme fonts for previews), Providers (next-themes, tooltips, toasts)
│   ├── globals.css             shadcn neutral tokens (light + .dark)
│   ├── login/                  Sign-in (public): page, login-form, actions (loginAction, logoutAction)
│   └── (console)/              Signed-in console: layout loads the superadmin, sidebar + top bar
│       ├── page.tsx            Overview (KPIs; Phase 6)
│       ├── tenants/
│       │   ├── page.tsx        List: status filter, search, pagination (searchParams)
│       │   ├── actions.ts      Every tenant server action
│       │   ├── new/            Create form (slug from name, preset cards)
│       │   └── [id]/           Detail: header actions (storefront link, open-store-admin-button, status-actions),
│       │                       provisioning-panel while PROVISIONING, else tabs:
│       │                       Overview (tenant-details-form, domains-card, owner-access-card) and
│       │                       Theme (theme-editor + theme-preview). Later: subscription, flags
│       ├── plans/  payments/  ledger/  settings/   Placeholders until their phases
├── components/
│   ├── ui/                     shadcn/ui, generated; don't hand-edit
│   ├── app-sidebar.tsx         Navigation (items in lib/navigation.ts); footer: signed-in user + sign out
│   ├── page-header.tsx         Title + description + actions, at the top of every page
│   ├── empty-state.tsx         No data yet / not built yet
│   ├── form-field.tsx          Label + input + field error, for server-action forms
│   ├── status-badge.tsx        TenantStatusBadge, TENANT_STATUSES, tenantStatusLabel
│   ├── theme-option.tsx        ThemeOption (a radio card) + ThemeThumbnail (a theme drawn from its tokens)
│   ├── providers.tsx, theme-toggle.tsx
└── lib/
    ├── navigation.ts           Sidebar items
    ├── api/                    server.ts (api(), ApiError, SESSION_COOKIE), schema.d.ts (generated), types.ts
    ├── session.ts              getCurrentSuperAdmin()
    ├── action-result.ts        ActionResult, formValues, toActionError
    ├── format.ts               formatDate, formatDateTime
    ├── theme-fonts.ts          The store theme fonts (preload: false), for the theme preview
    ├── theme-font-family.ts    THEME_FONT_FAMILY: theme font → CSS font-family (client-safe)
    └── utils.ts                cn()
```

## Tenant pages

- **Creating** a tenant returns at once (202) and redirects to its detail page, where `ProvisioningPanel` calls `router.refresh()` every 2 s until the status leaves `PROVISIONING`. A failure shows `provisioningError` with **Retry provisioning**.
- **Status actions** (`status-actions.tsx`) follow the API's transitions (SETUP/SUSPENDED → ACTIVE, SETUP/ACTIVE → SUSPENDED). Each confirms in an `AlertDialog` that states the effect on the storefront, and suspending requires a reason (3–500 characters).
- **Domains:** one domain is primary (`isPrimary`; used for the storefront link and set-password links). It's the first one at creation; **Make primary** (`setPrimaryDomainAction`) changes it. Removing the primary domain makes the oldest remaining one primary, and the API refuses to remove the last domain.
- **Owner access:** creates a one-time set-password link (valid 7 days; replaces any unused one) and shows it with a copy button. It's shown once; it isn't stored in readable form. It needs an owner email on the tenant.
- **Open store admin** (`open-store-admin-button.tsx`): store content is edited in the store's own `/admin`, never in a second editor here. The button calls `createAdminAccessLinkAction` (a server action, so it's a POST with Next's origin check; the API audits it), then sends a tab it opened **before** the await to the returned link, because browsers block windows opened after an await. The link works once, for 2 minutes, and signs the superadmin in as "Platform" with owner rights for 4 hours. Don't turn it into a GET route or a plain link: a GET that creates a session could be triggered by another site.
- **Theme editor** (`theme-editor.tsx`): draft state on the client, saved with `saveThemeAction` (the API then revalidates the storefronts). `theme-preview.tsx` renders a mini storefront with inline styles from the draft, so the console's own tokens never leak into it. Keep it in step with the storefront when the theme schema changes.
  - **Picker:** a card per preset plus **Custom** (`ThemeOption`). The selected card is computed: the preset whose tokens equal the draft (`sameTheme`, ignoring key order and hex case), else Custom. Every token change goes through `edit()`, which also remembers the latest custom design, so trying presets never loses it and clicking Custom brings it back. A custom theme keeps `preset` as the key it started from ("based on").
  - **Layout:** at `xl` the preview column (`aside`) is `sticky` beside the scrolling form, with Save/Discard at its top; the preview scrolls on its own if it's taller than the window. The grid needs `items-start`, or the sticky column stretches and never sticks.
  - **Contrast check:** `CONTRAST_PAIRS` lists the foreground/background token pairs the storefront actually uses; pairs below `MIN_CONTRAST` (4.5:1, WCAG AA) are flagged under each colour and in a summary. It warns but doesn't block saving. Add a pair whenever the storefront starts using a new combination.

## Conventions

- **Server Components by default;** `"use client"` only for interactivity. Data is fetched in Server Components; mutations go through server actions that call the API and then `revalidatePath` / `refresh()`.
- **Every page** starts with `<PageHeader title description actions />`, then content in cards, tables or tabs. A list with no rows shows `<EmptyState>`.
- **Styling:**
  - shadcn tokens only (`bg-background`, `text-muted-foreground`, `bg-primary`, `border`…); no raw colours.
  - Status colours come from the badge mapping in the `console-ui` skill.
  - Both light and dark mode must work.
- **Forms:** `FormField` (`src/components/form-field.tsx`: shadcn `Label` + `Input`/`Textarea` + error) with `useActionState` and a server action. The API validates; show its `error.details` (`fieldErrors`) next to the matching fields. Mirror simple rules client-side (`required`, `pattern`) only for fast feedback.
- **Tables:** shadcn `Table`, server-side pagination and filters via `searchParams`. Numbers and money are right-aligned with `tabular-nums`.
- **Feedback:** `toast` (sonner) after mutations; inline errors for validation.

## Verifying changes

1. Run `pnpm typecheck` and `pnpm lint`.
2. Run `pnpm dev` and check the page in light and dark mode, plus a narrow window (sidebar collapses to a sheet).
3. For anything that changes a tenant, check the effect in the storefront too: open `http://<store>.localhost:3000`. Theme and status changes should show on the next page load (the API revalidates the storefront).
4. Use a throwaway tenant (e.g. `pnpm tenant:create --slug test1 … --domain test1.localhost` in the API repo) for destructive checks such as suspend or removing domains, never the user's `acme`.
5. Stop every dev server you started, by port.
