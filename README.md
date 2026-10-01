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

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server on port 3001 |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm typecheck` | Generates route types and type-checks |
| `pnpm lint` | ESLint |
| `pnpm api:types` | Regenerates the API types from the running API's OpenAPI document |

## Status

Phase 0 (foundation): the console shell is in place (sidebar, top bar, light and dark mode), with a page for each section: Overview, Tenants, Plans, Payments, Ledger and Settings. There's also a sign-in screen. Features arrive phase by phase:

| Phase | Adds |
| --- | --- |
| 1 | Sign-in, tenant creation with automatic schema provisioning, tenant status actions, theme editor |
| 3 | Store content editing (slider, homepage sections, navigation, footer) |
| 5 | Plans, subscriptions with per-tenant discounts or custom prices, payment confirmation, reminders and auto-suspension |
| 6 | Analytics and ledgers |

See the full plan in [../Scent-OS/docs/system-design.md](../Scent-OS/docs/system-design.md). Developer rules: [CLAUDE.md](CLAUDE.md) and [.claude/skills/console-ui/SKILL.md](.claude/skills/console-ui/SKILL.md).
