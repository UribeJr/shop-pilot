# Notion MCP Integration Setup

This guide walks through connecting Shop Pilot to Notion for the **Notion MCP challenge**.

## Architecture

```
┌─────────────────────┐     writes      ┌─────────────────────┐
│  Shop Pilot         │ ──────────────► │  Notion Workspace   │
│  (Shopify app)      │   Notion API    │  - Store Dashboard  │
│                     │                 │  - Weekly Reports   │
└─────────────────────┘                 │  - KPI History     │
                                        │  - Products to Watch│
                                        │  - Alerts           │
                                        └──────────┬──────────┘
                                                   │
                                                   │ reads via
                                                   │ Notion MCP
                                                   ▼
                                        ┌─────────────────────┐
                                        │  AI (Cursor, etc.)  │
                                        │  "What are my top   │
                                        │   products?"        │
                                        └─────────────────────┘
```

**The superpowers:** Your AI assistant, connected via Notion MCP, can search and reason over your store data because Shop Pilot writes it into Notion.

---

## Part 1: Notion API (app writes to Notion)

### 1. Create a Notion integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Name it (e.g. "Shop Pilot")
4. Select your workspace
5. Copy the **Internal Integration Secret** → this is `NOTION_API_KEY`

### 2. Create and share a parent page

1. In Notion, create a new page (e.g. "Shop Pilot" or "Store Intelligence")
2. Click **•••** (more) in the top-right → **Add connections**
3. Select your Shop Pilot integration
4. The page is now shared with the integration

### 3. Get the page ID

The page URL looks like:

```
https://www.notion.so/YourWorkspace/Store-Intelligence-abc123def456789...
```

The **page ID** is the 32-character hex at the end (with or without dashes):

- `abc123def45678901234567890123456`
- or `abc123de-f456-7890-1234-567890123456`

Use this as `NOTION_PARENT_PAGE_ID`.

### 4. Configure your app

Add to `.env`:

```bash
NOTION_MCP_MODE="real"
NOTION_API_KEY="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NOTION_PARENT_PAGE_ID="your-page-id-here"
```

Restart the app.

### 5. Run sync

1. Go to http://localhost:3000/setup
2. Click **Use real Notion adapter**
3. Click **Generate report now** (or visit `/api/sync`)

On first sync, Shop Pilot will create under your parent page:

- **Store Dashboard** – summary page
- **Weekly Reports** – database of report pages
- **KPI History** – database of KPI records
- **Products to Watch** – database of product highlights
- **Alerts** – database of active alerts
- **Merchant Preferences** – page for customizing report behavior (optional)

---

## Part 2: Notion MCP (AI reads from Notion)

### Option A: Embedded chat in Notion (recommended for demos)

Shop Pilot includes an **embeddable chat** that uses real Notion MCP inside the app:

1. Go to `{SHOPIFY_APP_URL}/embed/chat` (e.g. `http://localhost:3000/embed/chat`)
2. Click **Connect Notion** and complete the OAuth flow
3. Chat with AI over your Notion workspace — it uses MCP tools to search, read, and reason over your synced store data
4. **Embed in Notion:** After running sync, the Store Dashboard shows a callout with the embed URL. In Notion, add an embed block (`/embed`) and paste that URL to have the chat inside your dashboard page

**Required:** Add `OPENAI_API_KEY` to `.env` so the chat can use an LLM with MCP tools.

**Embed in Notion requires HTTPS:** Notion loads embeds inside an iframe. Because Notion is served over HTTPS, the embed URL must also use HTTPS. `http://localhost:3000` will be blocked by the browser (mixed content). Deploy to a host with HTTPS (e.g. Render, Vercel) or use a tunnel like [ngrok](https://ngrok.com) (`ngrok http 3000`) to get an HTTPS URL for local testing.

### Option B: Connect Notion MCP in your AI tool

**Cursor:**

1. Open Cursor Settings → MCP
2. Add Notion MCP (or use the built-in Notion workspace plugin)
3. Follow the OAuth flow to connect your Notion workspace

**ChatGPT / Claude:**

1. Add "Notion MCP" from your tool’s integration directory
2. Use URL: `https://mcp.notion.com/mcp`
3. Complete OAuth to connect

### Demonstrate the workflow

Once connected:

1. **Ask your AI:** "What are my top products this week?"
   - The AI uses Notion MCP to search your workspace
   - It finds the Weekly Report and Products to Watch that Shop Pilot wrote
   - It answers from your live store data

2. **Ask:** "What products need restocking?"
   - The AI reads the Alerts database
   - It surfaces critical inventory items

3. **Ask:** "Summarize my store performance"
   - The AI reads the Store Dashboard and KPI History
   - It gives a summary from your synced analytics

---

## Merchant Preferences (optional)

Edit the **Merchant Preferences** page in Notion to tune reports. Use format:

```
Business focus: Focus on repeat purchases and spring collection
Tone: operator
Priority SKUs: SPR-001, SPR-004
Notes: Alert me only for major revenue drops
```

These preferences affect the executive summary, alert thresholds, and product prioritization in the next sync.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "NOTION_API_KEY or NOTION_PARENT_PAGE_ID is missing" | Add both vars to `.env` and restart |
| 401 from Notion API | Verify the page is shared with your integration |
| 404 from Notion API | Check the page ID (no extra characters) |
| "Use real Notion adapter" disabled | `NOTION_API_KEY` and `NOTION_PARENT_PAGE_ID` must both be set |
| Duplicate content in Notion | Shop Pilot reuses existing structure; first run creates it, later runs add new rows |
| "This embed couldn't be loaded" in Notion | Use HTTPS for the embed URL. localhost won't work (mixed content). Deploy to production or use ngrok for local testing |
