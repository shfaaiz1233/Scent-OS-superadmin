# Scent-OS superadmin

The platform owner's console for Scent-OS. From here you:
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
| `API_URL` | The Scent-OS API, e.g. `http://localhost:6001`. Only used on the server |
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
- **Overview tab:** edit the store and owner details, add or remove domains (**Make primary** chooses which one links use), and create the owner's **set-password link** (Owner access). Send that link to the owner yourself (e.g. WhatsApp) until email sending arrives in Phase 5. It's valid for 7 days, works once, and also serves as a password reset.
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

Phase 0 (the console shell: sidebar, top bar, light and dark mode, a page for each section) and Phase 1 are done. Overview, Plans, Payments, Ledger and Settings are placeholders until their phases:

| Phase | Adds |
| --- | --- |
| 1 ✅ | Sign-in, tenant creation with automatic schema provisioning, tenant details and domains, activate / suspend, owner set-password links, theme editor |
| 3 | Store content editing (slider, homepage sections, navigation, footer) |
| 5 | Plans, subscriptions with per-tenant discounts or custom prices, payment confirmation, reminders and auto-suspension |
| 6 | Analytics and ledgers |

See the full plan in [../Scent-OS/docs/system-design.md](../Scent-OS/docs/system-design.md). Developer rules: [CLAUDE.md](CLAUDE.md) and [.claude/skills/console-ui/SKILL.md](.claude/skills/console-ui/SKILL.md).
