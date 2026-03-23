# Dev Store Setup Checklist

Use this when moving from demo mode to a real Shopify dev store.

## Prerequisites

- [x] Shopify app created in Partner Dashboard
- [x] `shopify.app.toml` configured with `client_id` and `dev_store_url`
- [x] App running locally (`npm run dev`)

## 1. Get API credentials from Partner Dashboard

1. Go to [Partners Dashboard](https://partners.shopify.com) → **Apps** → your app
2. Open **Configuration** (or **App setup** → **Client credentials**)
3. Copy:
   - **Client ID** → `NEXT_PUBLIC_SHOPIFY_API_KEY`
   - **Client secret** → `SHOPIFY_API_SECRET`

> Your `shopify.app.toml` already has `client_id = "6388125a1f9f95ce491ffaa8cff7873b"` — that’s the Client ID.

## 2. Configure `.env`

Create or update `.env` in the project root:

```bash
# Required for real Shopify install
NEXT_PUBLIC_SHOPIFY_API_KEY="6388125a1f9f95ce491ffaa8cff7873b"
SHOPIFY_API_SECRET="your_client_secret_from_partners"

# App URL (must match shopify.app.toml)
SHOPIFY_APP_URL="http://localhost:3000"
SHOPIFY_APP_HANDLE="notion-store-analyst"

# Database
DATABASE_URL="file:./prisma/dev.db"

# Keep Notion in mock mode for now
NOTION_MCP_MODE="mock"
```

**Important:** Do not commit `.env`. Add it to `.gitignore` if it isn’t already.

## 3. Configure app URL in Partner Dashboard

1. Partners Dashboard → your app → **Configuration**
2. Set **App URL** to: `http://localhost:3000`
3. Add **Allowed redirection URL(s)**:
   - `http://localhost:3000/api/shopify/callback`

This must match `shopify.app.toml`:

```toml
application_url = "http://localhost:3000"
[auth]
redirect_urls = ["http://localhost:3000/api/shopify/callback"]
```

## 4. Prepare the database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## 5. Start the app

```bash
npm run dev
```

## 6. Install on your dev store

**Option A: From setup page**

1. Open http://localhost:3000/setup
2. Enter your dev store domain: `euribe-dev-store.myshopify.com` (or your store’s domain)
3. Click **Install on dev store**
4. Approve permissions in Shopify
5. You should be redirected back to Shopify Admin with the app installed

**Option B: From Partner Dashboard**

1. Partners Dashboard → your app → **Test your app**
2. Choose your dev store
3. Click **Select store** / **Install**
4. Shopify will redirect to your app’s `application_url` with `?shop=...&host=...`

> If you use Option B, the app needs to detect `shop` from the query string and start OAuth when the store is not yet installed. The current flow expects you to go through the setup form first.

## 7. Verify installation

After install:

- `/setup` shows: **Installed Shopify shop: euribe-dev-store.myshopify.com**
- `/status` shows last sync info (after you run sync)
- **Generate report now** uses real store data instead of mock data

## Troubleshooting

### "Add NEXT_PUBLIC_SHOPIFY_API_KEY and SHOPIFY_API_SECRET"

→ Create/update `.env` with both variables and restart the dev server.

### "Missing shop or code" on callback

→ Ensure `redirect_urls` in Partner Dashboard includes exactly:
`http://localhost:3000/api/shopify/callback`

### "Invalid OAuth state"

→ Clear cookies for `localhost:3000` and run the install again. State is stored in a cookie.

### Embedded app loads blank in Shopify Admin

→ For embedded apps, Shopify loads your app in an iframe. If the app URL is `localhost`, it only works when testing from the same machine. For remote testing, use a tunnel (e.g. `shopify app dev` or ngrok).

## Optional: Use Shopify CLI for dev

For automatic tunneling and URL updates:

```bash
# If you have Shopify CLI installed
shopify app dev
```

This starts a tunnel, updates app URLs, and runs your app. The `shopify.web.toml` already configures `dev = "npm run dev"`.
