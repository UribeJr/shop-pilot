# Deploy Shop Pilot to Render

This guide walks you through deploying Shop Pilot to Render under your personal account.

## Prerequisites

1. **GitHub account** – Render deploys from Git
2. **Render account** – Sign up at [render.com](https://render.com) (free)
3. **Shopify Partner account** – For app credentials
4. **Notion integration** – API key and parent page ID
5. **OpenAI API key** – For the MCP embed chat

## Step 1: Push to GitHub

If the project isn't in a Git repo yet:

```bash
cd /path/to/shop-pilot
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [GitHub](https://github.com/new) (e.g. `shop-pilot`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/shop-pilot.git
git branch -M main
git push -u origin main
```

## Step 2: Open the Blueprint

Once the repo is pushed, open this link (replace `YOUR_USERNAME` with your GitHub username):

**https://dashboard.render.com/blueprint/new?repo=https://github.com/YOUR_USERNAME/shop-pilot**

Or, if your repo is under an organization:
`https://dashboard.render.com/blueprint/new?repo=https://github.com/ORG_NAME/shop-pilot`

## Step 3: Connect GitHub

1. Click the deeplink above
2. Log in to Render if needed
3. If prompted, connect your GitHub account (grant Render access to the repo)
4. Render will read `render.yaml` from the repo

## Step 4: Apply the Blueprint

1. Review the services and database in the Blueprint
2. Click **Apply**
3. Wait for the first deploy (about 5–10 minutes)

## Step 5: Set Environment Variables

After the first deploy, set these in the Render Dashboard:

1. Open your **shop-pilot** web service
2. Go to **Environment**
3. Add or edit these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_APP_URL` | **Critical** – Your Render app URL | `https://shop-pilot-xxxx.onrender.com` |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | From Shopify Partners | `6388125a1f9f95ce491ffaa8...` |
| `SHOPIFY_API_SECRET` | From Shopify Partners | `shpss_...` |
| `SHOPIFY_WEBHOOK_SECRET` | From Shopify app settings | |
| `NOTION_API_KEY` | From notion.so/my-integrations | `ntn_...` |
| `NOTION_PARENT_PAGE_ID` | 32-char page ID from your Notion page | `32cd2021834a80f48e...` |
| `OPENAI_API_KEY` | For MCP embed chat | `sk-...` |

**Important:** Set `SHOPIFY_APP_URL` to your actual Render URL (e.g. `https://shop-pilot-xxxx.onrender.com`) so OAuth callbacks and the Notion embed work.

## Step 6: Update Shopify App Settings

In the [Shopify Partner Dashboard](https://partners.shopify.com):

1. Open your app → **App setup**
2. Set **App URL** to `https://YOUR-RENDER-URL.onrender.com`
3. Set **Allowed redirection URL(s)** to include:
   - `https://YOUR-RENDER-URL.onrender.com/api/shopify/callback`
   - `https://YOUR-RENDER-URL.onrender.com/api/mcp/auth/callback`

## Step 7: Embed in Notion

After deploy, the Store Dashboard in Notion will show a callout with the embed URL:
`https://YOUR-RENDER-URL.onrender.com/embed/chat`

Use that URL in a Notion embed block (`/embed`) to show the chat inside your dashboard.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `prisma generate` | Ensure `schema.postgresql.prisma` exists and the database is linked |
| 401 from Shopify | Verify `SHOPIFY_APP_URL` matches your Render URL and redirect URIs are correct |
| Embed "couldn't be loaded" in Notion | Use HTTPS (Render provides this). Ensure `SHOPIFY_APP_URL` is set |
| MCP chat returns errors | Add `OPENAI_API_KEY` and reconnect Notion via the embed |
