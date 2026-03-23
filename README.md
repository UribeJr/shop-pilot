# Notion Store Analyst

Notion Store Analyst is a demo-ready Shopify MVP where Notion is the operating surface, not an export target. Shopify supplies commerce data, analytics converts it into store intelligence, and the Notion MCP layer reads merchant preferences and writes back structured pages and databases that evolve over time.

## Architecture

### Core posture
- Embedded Shopify admin app with a minimal Next.js surface in `apps/web`
- Shopify Admin GraphQL as the commerce source of truth
- Notion MCP client package with a real adapter and a mock adapter behind the same interface
- Prisma + SQLite for local installs, sync history, reports, KPI records, alert records, and product watch snapshots
- Analytics package that computes KPIs, product performance, inventory risks, alerts, and weekly report narratives

### Monorepo layout
- `apps/web`: minimal embedded admin UI, setup/status/reports/demo routes, sync endpoint, webhook stub
- `packages/shopify-client`: validated Admin GraphQL queries, mock/demo store data, and snapshot service
- `packages/analytics`: KPI formulas, product scoring, inventory risk logic, report generation
- `packages/notion-mcp`: Notion MCP contract, real adapter, mock adapter, report/database payload mappers
- `packages/shared`: domain types, constants, env parsing
- `prisma`: schema and seed script
- `scripts`: challenge demo automation such as end-to-end sync

## File Tree

```text
.
├── .env.example
├── README.md
├── apps
│   └── web
│       ├── app
│       │   ├── (admin)
│       │   │   ├── demo/page.tsx
│       │   │   ├── reports/page.tsx
│       │   │   ├── setup/page.tsx
│       │   │   └── status/page.tsx
│       │   ├── api
│       │   │   ├── setup/notion-mode/route.ts
│       │   │   ├── sync/route.ts
│       │   │   └── webhooks/shopify/route.ts
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components
│       │   ├── admin-shell.tsx
│       │   └── embedded-app-provider.tsx
│       ├── lib
│       │   ├── config.ts
│       │   ├── prisma.ts
│       │   ├── shopify-auth.ts
│       │   └── sync.ts
│       ├── next.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── data
│   └── demo
│       ├── notion-preference-change.md
│       ├── sample-merchant-profile.json
│       └── sample-report-output.md
├── package.json
├── packages
│   ├── analytics
│   │   └── src
│   │       ├── index.ts
│   │       ├── metrics.ts
│   │       └── report.ts
│   ├── notion-mcp
│   │   └── src
│   │       ├── adapters
│   │       │   ├── mockNotionMcpAdapter.ts
│   │       │   └── realNotionMcpAdapter.ts
│   │       ├── client.ts
│   │       ├── index.ts
│   │       ├── mappers
│   │       │   ├── databaseMapper.ts
│   │       │   └── reportMapper.ts
│   │       ├── types.ts
│   ├── shared
│   │   └── src
│   │       ├── constants.ts
│   │       ├── env.ts
│   │       ├── index.ts
│   │       └── types.ts
│   └── shopify-client
│       └── src
│           ├── client.ts
│           ├── demoData.ts
│           ├── index.ts
│           ├── queries.ts
│           └── service.ts
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── scripts
│   └── run-demo-sync.ts
└── tsconfig.base.json
```

## KPI Definitions

These formulas are implemented in `packages/analytics/src/metrics.ts`.

- Revenue = sum of paid orders in the reporting window
- Orders = count of paid orders in the reporting window
- AOV = revenue / orders, guarded to `0` when orders are `0`
- Repeat customer rate = customers with more than one lifetime order / total customers in the period
- Inventory risk = variant inventory quantity at or below the defined threshold, with `critical` at half-threshold or lower

### Assumptions and edge cases
- Only paid orders are counted in KPI and product-performance calculations.
- The 30-day baseline is converted into an expected weekly run-rate to detect revenue drops.
- Missing customer IDs reduce repeat-customer precision, so guest checkout orders are excluded from the repeat-customer denominator.
- Inventory thresholds default to `8` for the MVP and should become merchant-configurable in production.
- Product underperformance is benchmarked against the current window’s catalog average revenue.

## Notion Workspace Structure

The app is designed to maintain these Notion targets:
- Page: `Store Dashboard`
- Database: `Weekly Reports`
- Database: `KPI History`
- Database: `Products to Watch`
- Database: `Alerts`
- Optional Page: `Merchant Preferences`

Merchant preferences are read from Notion and directly affect the generated narrative, alert suppression, and product prioritization logic.

## Shopify Notes

This MVP follows current Shopify guidance directionally, while respecting the request for Next.js:
- Embedded admin posture with App Bridge-ready config hooks in `apps/web/lib/shopify-auth.ts`
- Polaris-based admin UI in `apps/web`
- Shopify Admin GraphQL as the primary API surface
- Webhook verification stub plus uninstall cleanup in `apps/web/app/api/webhooks/shopify/route.ts`
- Local persistence for install/session-adjacent state in Prisma

Current Shopify reference points used during implementation planning:
- [Shopify App package for React Router](https://shopify.dev/docs/api/shopify-app-react-router/latest)
- [Interacting with Shopify Admin](https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-admin)
- [Webhook authentication](https://shopify.dev/docs/api/shopify-app-react-router/latest/authenticate/webhook)

The GraphQL operations in `packages/shopify-client/src/queries.ts` were validated against the current Admin schema with the Shopify Dev MCP tooling.

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and keep `NOTION_MCP_MODE=mock` if you want a zero-credential demo:

```bash
cp .env.example .env
```

3. Generate Prisma client, create the SQLite schema, and seed demo data:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start the Next.js app:

```bash
npm run dev
```

5. Open [http://localhost:3000/setup](http://localhost:3000/setup).

6. Run a sync:
- Visit `/api/sync` directly for a JSON response
- Or use the "Generate report now" action from the UI

7. For a CLI-style challenge demo, run:

```bash
npm run demo:sync
```

This writes demo payloads into `data/demo`.

## Real Shopify Integration

If you want to move off the seeded demo store and install this app on a real Shopify dev store, use this path.

### 1. Create or link a Shopify app

Use Shopify CLI against a Partner app and dev store:

```bash
shopify app config link
```

Then update:
- [shopify.app.toml](/Users/euribe/Desktop/projectos/shop-pilot/shopify.app.toml)
- [apps/web/shopify.web.toml](/Users/euribe/Desktop/projectos/shop-pilot/apps/web/shopify.web.toml)

Set these values correctly:
- `client_id`
- `application_url`
- `build.dev_store_url`
- `auth.redirect_urls`

Shopify docs used for this setup:
- [App configuration](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration)
- [App structure](https://shopify.dev/docs/apps/build/cli-for-apps/app-structure)
- [Authentication and authorization](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Set up embedded app authorization](https://shopify.dev/docs/apps/build/authentication-authorization/set-embedded-app-authorization?extension=javascript)

### 2. Fill in local env

Populate `.env` with at least:

```bash
NEXT_PUBLIC_SHOPIFY_API_KEY="..."
SHOPIFY_API_SECRET="..."
SHOPIFY_APP_URL="http://localhost:3000"
SHOPIFY_APP_HANDLE="notion-store-analyst"
```

Do not set `SHOPIFY_SHOP_DOMAIN` or `SHOPIFY_ADMIN_ACCESS_TOKEN` if you want the app to use the persisted OAuth install path. Those env vars are still useful for direct testing, but the preferred real path now is OAuth install into Prisma.

### 3. Start the app

```bash
npm run dev
```

### 4. Install on a dev store

Open `/setup`, enter your dev store domain, and use the install form. This hits:
- [apps/web/app/api/shopify/install/route.ts](/Users/euribe/Desktop/projectos/shop-pilot/apps/web/app/api/shopify/install/route.ts)
- [apps/web/app/api/shopify/callback/route.ts](/Users/euribe/Desktop/projectos/shop-pilot/apps/web/app/api/shopify/callback/route.ts)

The callback exchanges the code for an offline Admin API token and persists it into Prisma. After install, sync automatically prefers the installed shop token over the mock dataset.

### 5. Verify the switch from mock to real

After install:
- `/setup` should show `Installed Shopify shop: your-store.myshopify.com`
- `/status` should reflect syncs for the real store once you run sync
- `/demo` should show Notion payloads generated from live Shopify data

### 6. Webhooks

The repo includes:
- [apps/web/app/api/webhooks/shopify/route.ts](/Users/euribe/Desktop/projectos/shop-pilot/apps/web/app/api/webhooks/shopify/route.ts)

and app-level webhook config in:
- [shopify.app.toml](/Users/euribe/Desktop/projectos/shop-pilot/shopify.app.toml)

For local development, Shopify CLI should forward app webhooks once the app config is linked correctly.

## Real Notion Integration

The Notion side is still adapter-based. To use the real Notion MCP transport, set:

```bash
NOTION_MCP_MODE="real"
NOTION_MCP_BASE_URL="..."
NOTION_MCP_API_KEY="..."
```

Then use the adapter switch in `/setup`. The real adapter implementation is in:
- [packages/notion-mcp/src/adapters/realNotionMcpAdapter.ts](/Users/euribe/Desktop/projectos/shop-pilot/packages/notion-mcp/src/adapters/realNotionMcpAdapter.ts)

This assumes an HTTP-accessible Notion MCP gateway. If your actual MCP runtime uses a different auth or transport shape, adjust that adapter only; the rest of the app stays unchanged.

## Demo Flow

Use this exact sequence for the challenge recording:

1. Open `/setup` and show that the app is a minimal embedded control panel, not the main reporting destination.
2. Open `/status` and show the last sync metadata plus KPI snapshot.
3. Open `/demo` and show the Notion page/database payloads.
4. Point to `data/demo/sample-merchant-profile.json` to show the merchant context being read from Notion.
5. Point to `data/demo/notion-preference-change.md` and explain that changing Notion preferences shifts recommendations, alert strictness, and product prioritization.
6. Re-run `/api/sync` or `npm run demo:sync` to show the updated report path.

## Production Gaps

- Shopify installation and callback routes are wired, but a full Shopify-managed installation plus token-exchange implementation would be closer to Shopify’s preferred embedded strategy than the current offline-token OAuth callback.
- Real App Bridge session-token verification for every embedded request is still not wired end-to-end.
- Webhook verification and uninstall cleanup are present, but broader topic registration and background processing are still minimal.
- The Next.js implementation is production-minded but Shopify’s most turnkey official scaffold today is the React Router template, so a production build may migrate auth/session code toward that stack.
- Real Notion MCP transport assumes a generic HTTP shape. Final auth handshake, tool invocation semantics, and permission scopes must be aligned to the actual Notion MCP runtime you deploy.
- Inventory thresholds and merchant preferences should move from hardcoded/demo values into editable persisted records or live Notion-backed configuration.
- Background jobs, retries, deduplication, and rate-limit controls still need a production queue.
- SQLite is correct for local challenge work; Postgres should back production.

## Why The Demo Proves Notion MCP Value

- Notion is the source of merchant intent: goals, tone, alert strictness, and SKU priorities are read from the Notion-side context before the report is generated.
- Notion is the destination of operating data: dashboard content, weekly report content, KPI history, products to watch, and alerts are all mapped as first-class Notion payloads.
- Notion changes the output, not just the storage: changing preferences in Notion changes the executive summary, recommendations, alerting behavior, and what gets prioritized.
- The Shopify admin app stays deliberately light, proving that the merchant’s working surface is Notion rather than an internal dashboard.
