# The Scent System: superadmin console

The platform owner's console for The Scent System. From here you:
- onboard perfume retailers (tenants), which creates each one's database schema
- set each store's theme, content and feature flags
- manage plans and per-tenant pricing
- confirm subscription payments
- suspend or reactivate stores
- review ledgers and analytics

Built with Next.js 16, React 19, Tailwind CSS 4 and shadcn/ui (minimal, neutral design with light and dark mode), managed with pnpm. It talks to the [Scent-OS API](../Scent-OS) from its own server only.

## Setup

```bash
pnpm install
cp .env.example .env.local      # PowerShell: Copy-Item .env.example .env.local
pnpm dev
```

Open <http://localhost:3001>. The storefront runs on :3000 and the API on :6001.

| Variable | Description |
| --- | --- |
| `API_URL` | The Scent System API, e.g. `http://localhost:6001`. Only used on the server |
| `API_BFF_SECRET` | Same value as `BFF_SECRET` in the API's `.env`. Lets the API see your IP, so sign-in rate limits apply per person |

## Signing in

There's no sign-up. Create your account in the API repo (local database), then sign in at <http://localhost:3001/login>:

```bash
# in ../Scent-OS
pnpm superadmin:create --email you@example.com --name "Your Name"
```

Without `--password`, a strong password is generated and printed once. Sessions last 12 hours; after that you're asked to sign in again.

## Managing stores

- **Tenants → New tenant:** name, slug (permanent; becomes the database schema), owner contact, domains (one per line or comma-separated; the first becomes the primary domain used in links) and a theme preset. Provisioning runs in the background and the page updates by itself; if it fails, the error is shown with **Retry provisioning**.
- **New stores start in SETUP:** the owner can use `/admin`, and the storefront says "Opening soon". Use **Activate** to make it live, and **Suspend** (with a reason) to take it offline; the data is kept.
- **Domains on Vercel:** a store's domain also has to be added to the storefront's Vercel project (Settings → Domains), and its DNS pointed there. The console doesn't do this for you yet. See [deployment](../Scent-OS/docs/deployment.md#5-the-storefront-project).
- **Overview tab:** edit the store and owner details, add or remove domains (**Make primary** chooses which one links use), and create the owner's **set-password link** (Owner access). Send that link to the owner yourself (e.g. WhatsApp) until email sending arrives in Phase 5. It's valid for 7 days, works once, and also serves as a password reset.
- **Open store admin** (top of a store's page): opens the store's own `/admin` in a new tab, signed in as **Platform** with owner rights, to edit its homepage, menus, pages, settings or products for the owner. The session lasts up to 4 hours; each use is in the audit log. Renaming the store here or in the store's Settings changes the same name.
- **Theme tab:** pick a preset, adjust colours, corner radius, fonts, motion, product cards and buttons, and watch the live preview. Colour pairs that are hard to read (below the WCAG AA contrast of 4.5:1) are flagged. Saving updates the storefront on its next page load.

Every change is recorded in the audit log.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server on port 3001 |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm typecheck` | Generates route types and type-checks |
| `pnpm lint` | ESLint |
| `pnpm api:types` | Regenerates the API types from the running API's OpenAPI document |

## Status

Phase 0 (the console shell: sidebar, top bar, light and dark mode, a page for each section), Phase 1 and Phase 3 are done. Overview, Plans, Payments, Ledger and Settings are placeholders until their phases:

| Phase | Adds |
| --- | --- |
| 1 ✅ | Sign-in, tenant creation with automatic schema provisioning, tenant details and domains, activate / suspend, owner set-password links, theme editor |
| 3 ✅ | **Open store admin**: edit a store's content (slider, homepage sections, menus, footer, pages, settings) in its own admin, signed in as Platform |
| 5 | Plans, subscriptions with per-tenant discounts or custom prices, payment confirmation, reminders and auto-suspension |
| 6 | Analytics and ledgers |

Orders (Phase 4) are handled in each store's own admin; the console gets the platform's sales figures with the ledgers (Phase 6).

The console runs on Vercel at `app.thescentsystem.store`; see [../Scent-OS/docs/deployment.md](../Scent-OS/docs/deployment.md).

See the full plan in [../Scent-OS/docs/system-design.md](../Scent-OS/docs/system-design.md). Developer rules: [CLAUDE.md](CLAUDE.md) and [.claude/skills/console-ui/SKILL.md](.claude/skills/console-ui/SKILL.md).
