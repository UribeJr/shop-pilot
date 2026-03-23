/**
 * Notion API Adapter
 *
 * Uses the official Notion REST API (api.notion.com) to read and write
 * store analytics into a Notion workspace. This powers the "real" integration
 * for the Notion MCP challenge.
 *
 * MCP value: The Shopify app writes commerce data here. The merchant's AI
 * (Cursor, ChatGPT, Claude) connected via Notion MCP can then search, read,
 * and reason over this data — giving them store intelligence superpowers.
 */

import { Client } from "@notionhq/client";

type RichTextItemRequest = { type: "text"; text: { content: string } };

type BlockRequest =
  | { type: "heading_2"; heading_2: { rich_text: RichTextItemRequest[] } }
  | { type: "heading_3"; heading_3: { rich_text: RichTextItemRequest[] } }
  | { type: "paragraph"; paragraph: { rich_text: RichTextItemRequest[] } }
  | { type: "bulleted_list_item"; bulleted_list_item: { rich_text: RichTextItemRequest[] } }
  | {
      type: "callout";
      callout: {
        rich_text: RichTextItemRequest[];
        icon: { type: "emoji"; emoji: string };
        color?: "blue_background" | "green_background";
      };
    };
import type {
  MerchantContext,
  NotionAlertRecord,
  NotionKpiRecord,
  NotionProductWatchRecord,
  NotionWriteResult,
  WeeklyReport,
  WorkspaceStructure
} from "@notion-store-analyst/shared";
import type { NotionMcpAdapter, WorkspaceConnectionResult } from "../types";

const NOTION_VERSION = "2022-06-28";

function richText(content: string): RichTextItemRequest[] {
  return [{ type: "text", text: { content } }];
}

function titleProp(content: string) {
  return { title: richText(content) };
}

export class NotionApiAdapter implements NotionMcpAdapter {
  private readonly client: Client;
  private readonly parentPageId: string;
  private workspaceCache: WorkspaceStructure | null = null;

  private readonly embedChatUrl?: string;

  constructor(options: { apiKey: string; parentPageId: string; embedChatUrl?: string }) {
    this.client = new Client({
      auth: options.apiKey,
      notionVersion: NOTION_VERSION
    });
    this.parentPageId = options.parentPageId.replace(/-/g, "");
    this.embedChatUrl = options.embedChatUrl;
  }

  async connectWorkspace(): Promise<WorkspaceConnectionResult> {
    const page = await this.client.pages.retrieve({ page_id: this.parentPageId });
    let workspaceName = "Shop Pilot Workspace";
    if ("properties" in page && page.properties) {
      const props = page.properties as Record<string, { title?: { title?: Array<{ plain_text?: string }> } }>;
      const titleProp = props.title ?? Object.values(props).find((p) => p && typeof p === "object" && "title" in p);
      if (titleProp?.title?.title?.[0]?.plain_text) {
        workspaceName = titleProp.title.title[0].plain_text;
      }
    }
    return {
      workspaceId: this.parentPageId,
      workspaceName,
      mode: "real"
    };
  }

  async getMerchantContext(): Promise<MerchantContext> {
    const workspace = await this.ensureWorkspaceStructure();
    if (!workspace.preferencesPageId) {
      return this.getDefaultMerchantContext();
    }
    try {
      const blocks = await this.client.blocks.children.list({
        block_id: workspace.preferencesPageId
      });
      const text = blocks.results
        .filter((b) => "type" in b && (b as { type?: string }).type === "paragraph")
        .map((b) => {
          const paragraph = (b as { paragraph?: { rich_text?: Array<{ plain_text?: string }> } }).paragraph;
          return paragraph?.rich_text?.map((t) => t.plain_text ?? "").join("") ?? "";
        })
        .join("\n");
      return this.parseMerchantPreferences(text);
    } catch {
      return this.getDefaultMerchantContext();
    }
  }

  private getDefaultMerchantContext(): MerchantContext {
    return {
      workspaceName: "Shop Pilot Workspace",
      dashboardPageId: undefined,
      preferencesPageId: undefined,
      preferences: {
        businessFocus: "General store performance and growth",
        reportingTone: "operator",
        alertThreshold: 0.2,
        prioritySkus: [],
        priorityCollections: [],
        summaryNotes: "No preferences set. Add content to Merchant Preferences page in Notion."
      },
      reporting: {
        includeInventoryRisks: true,
        includeUnderperformers: true,
        majorDropOnly: false
      }
    };
  }

  private parseMerchantPreferences(text: string): MerchantContext {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const prefs: Record<string, string> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(":");
      if (key) prefs[key.trim().toLowerCase()] = rest.join(":").trim();
    }
    return {
      workspaceName: "Shop Pilot Workspace",
      preferences: {
        businessFocus: prefs["business focus"] ?? prefs["focus"] ?? "General store performance",
        reportingTone: (prefs["tone"] ?? "operator") as "concise" | "operator" | "executive",
        alertThreshold: parseFloat(prefs["alert threshold"] ?? "0.2") || 0.2,
        prioritySkus: (prefs["priority skus"] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        priorityCollections: (prefs["priority collections"] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        summaryNotes: prefs["notes"] ?? prefs["summary notes"] ?? ""
      },
      reporting: {
        includeInventoryRisks: (prefs["inventory risks"] ?? "true").toLowerCase() !== "false",
        includeUnderperformers: (prefs["underperformers"] ?? "true").toLowerCase() !== "false",
        majorDropOnly: (prefs["major drop only"] ?? "false").toLowerCase() === "true"
      }
    };
  }

  async getReportingPreferences(): Promise<MerchantContext["reporting"]> {
    const ctx = await this.getMerchantContext();
    return ctx.reporting;
  }

  async getPriorityProducts(): Promise<string[]> {
    const ctx = await this.getMerchantContext();
    return ctx.preferences.prioritySkus;
  }

  private async findExistingWorkspace(): Promise<WorkspaceStructure | null> {
    const blocks = await this.client.blocks.children.list({
      block_id: this.parentPageId,
      page_size: 50
    });
    let dashboardId: string | null = null;
    for (const block of blocks.results) {
      if ("type" in block && block.type === "child_page" && "child_page" in block) {
        const title = (block.child_page as { title?: string }).title ?? "";
        if (title === "Store Dashboard") dashboardId = block.id.replace(/-/g, "");
      }
    }
    if (!dashboardId) return null;
    const dashChildren = await this.client.blocks.children.list({
      block_id: dashboardId,
      page_size: 50
    });
    let prefsPageId: string | null = null;
    const dbIds: Record<string, string> = {};
    for (const block of dashChildren.results) {
      if ("type" in block && block.type === "child_page" && "child_page" in block) {
        const title = (block.child_page as { title?: string }).title ?? "";
        if (title === "Merchant Preferences") prefsPageId = block.id.replace(/-/g, "");
      }
      if ("type" in block && block.type === "child_database" && "child_database" in block) {
        const title = (block.child_database as { title?: string }).title ?? "";
        dbIds[title] = block.id.replace(/-/g, "");
      }
    }
    if (!dbIds["Weekly Reports"] || !dbIds["KPI History"] || !dbIds["Products to Watch"] || !dbIds["Alerts"]) {
      return null;
    }
    return {
      dashboardPageId: dashboardId,
      weeklyReportsDatabaseId: dbIds["Weekly Reports"],
      kpiHistoryDatabaseId: dbIds["KPI History"],
      productsToWatchDatabaseId: dbIds["Products to Watch"],
      alertsDatabaseId: dbIds["Alerts"],
      preferencesPageId: prefsPageId ?? undefined
    };
  }

  async ensureWorkspaceStructure(): Promise<WorkspaceStructure> {
    if (this.workspaceCache) return this.workspaceCache;

    const existing = await this.findExistingWorkspace();
    if (existing) {
      this.workspaceCache = existing;
      return existing;
    }

    const dashboardPage = await this.client.pages.create({
      parent: { type: "page_id", page_id: this.parentPageId },
      icon: { type: "emoji", emoji: "📊" },
      properties: {
        title: titleProp("Store Dashboard")
      }
    });

    const dashboardId = dashboardPage.id.replace(/-/g, "");

    const [weeklyReportsDb, kpiHistoryDb, productsDb, alertsDb] = await Promise.all([
      this.createDatabase(dashboardId, "Weekly Reports", {
        Title: { title: {} },
        Slug: { rich_text: {} },
        "Generated At": { date: {} },
        "Executive Summary": { rich_text: {} }
      }),
      this.createDatabase(dashboardId, "KPI History", {
        Name: { title: {} },
        Date: { date: {} },
        Window: { rich_text: {} },
        Revenue: { number: {} },
        Orders: { number: {} },
        AOV: { number: {} },
        "Repeat %": { number: {} }
      }),
      this.createDatabase(dashboardId, "Products to Watch", {
        Product: { title: {} },
        SKU: { rich_text: {} },
        Revenue: { number: {} },
        Units: { number: {} },
        Trend: { rich_text: {} },
        Reason: { rich_text: {} }
      }),
      this.createDatabase(dashboardId, "Alerts", {
        Title: { title: {} },
        Severity: { rich_text: {} },
        Body: { rich_text: {} },
        "Created At": { date: {} }
      })
    ]);

    const prefsPage = await this.client.pages.create({
      parent: { type: "page_id", page_id: dashboardId },
      icon: { type: "emoji", emoji: "⚙️" },
      properties: {
        title: titleProp("Merchant Preferences")
      },
      children: [
        {
          type: "callout",
          callout: {
            rich_text: richText("Add your preferences here. Use format: Key: value"),
            icon: { type: "emoji", emoji: "💡" },
            color: "gray_background"
          }
        },
        {
          type: "paragraph",
          paragraph: { rich_text: richText("Business focus: Your strategic focus (e.g. repeat purchases)") }
        },
        {
          type: "paragraph",
          paragraph: { rich_text: richText("Tone: concise | operator | executive") }
        },
        {
          type: "paragraph",
          paragraph: { rich_text: richText("Priority SKUs: SPR-001, SPR-004") }
        }
      ]
    });

    this.workspaceCache = {
      dashboardPageId: dashboardId,
      weeklyReportsDatabaseId: weeklyReportsDb,
      kpiHistoryDatabaseId: kpiHistoryDb,
      productsToWatchDatabaseId: productsDb,
      alertsDatabaseId: alertsDb,
      preferencesPageId: prefsPage.id.replace(/-/g, "")
    };

    return this.workspaceCache;
  }

  private async createDatabase(
    parentId: string,
    title: string,
    properties: Record<string, unknown>
  ): Promise<string> {
    const db = await this.client.databases.create({
      parent: { type: "page_id", page_id: parentId },
      title: richText(title),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: properties as any
    });
    return db.id.replace(/-/g, "");
  }

  async createWeeklyReport(report: WeeklyReport): Promise<NotionWriteResult> {
    const ws = await this.ensureWorkspaceStructure();
    const generated = new Date(report.generatedAt);
    const page = await this.client.pages.create({
      parent: { type: "database_id", database_id: ws.weeklyReportsDatabaseId },
      icon: { type: "emoji", emoji: "📈" },
      properties: {
        Title: titleProp(`Weekly Report • ${generated.toLocaleDateString("en-US")}`),
        Slug: { rich_text: richText(report.slug) },
        "Generated At": { date: { start: report.generatedAt } },
        "Executive Summary": { rich_text: richText(report.executiveSummary.slice(0, 2000)) }
      },
      // @ts-expect-error BlockRequest matches Notion block schema; SDK types are strict
      children: this.reportToBlocks(report)
    });
    return { targetId: page.id, action: "created" };
  }

  private reportToBlocks(report: WeeklyReport): BlockRequest[] {
    const blocks: BlockRequest[] = [];

    blocks.push({
      type: "heading_2",
      heading_2: { rich_text: richText("KPI Snapshot") }
    });
    for (const kpi of report.kpiSnapshot) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: richText(
            `${kpi.window}: $${kpi.revenue.toFixed(2)} revenue, ${kpi.orders} orders, AOV $${kpi.averageOrderValue.toFixed(2)}, Repeat ${(kpi.repeatCustomerRate * 100).toFixed(1)}%`
          )
        }
      });
    }

    blocks.push({
      type: "heading_2",
      heading_2: { rich_text: richText("Top Winners") }
    });
    for (const p of report.topWinners.slice(0, 5)) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: richText(`${p.title}: $${p.revenue.toFixed(2)} (${p.unitsSold} sold) - ${p.reason}`)
        }
      });
    }

    blocks.push({
      type: "heading_2",
      heading_2: { rich_text: richText("Products at Risk") }
    });
    for (const p of report.productsAtRisk.slice(0, 5)) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: richText(`${p.title}: $${p.revenue.toFixed(2)} - ${p.reason}`)
        }
      });
    }

    blocks.push({
      type: "heading_2",
      heading_2: { rich_text: richText("Recommended Actions") }
    });
    for (const action of report.recommendedActions) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: richText(action) }
      });
    }

    return blocks;
  }

  async upsertKpiRecords(records: NotionKpiRecord[]): Promise<NotionWriteResult[]> {
    const ws = await this.ensureWorkspaceStructure();
    const results: NotionWriteResult[] = [];
    for (const r of records) {
      const page = await this.client.pages.create({
        parent: { type: "database_id", database_id: ws.kpiHistoryDatabaseId },
        properties: {
          Name: titleProp(`${r.window} • ${new Date(r.date).toLocaleDateString("en-US")}`),
          Date: { date: { start: r.date } },
          Window: { rich_text: richText(r.window) },
          Revenue: { number: r.revenue },
          Orders: { number: r.orders },
          AOV: { number: r.averageOrderValue },
          "Repeat %": { number: r.repeatCustomerRate * 100 }
        }
      });
      results.push({ targetId: page.id, action: "created" });
    }
    return results;
  }

  async upsertProductsToWatch(records: NotionProductWatchRecord[]): Promise<NotionWriteResult[]> {
    const ws = await this.ensureWorkspaceStructure();
    const results: NotionWriteResult[] = [];
    for (const r of records) {
      const page = await this.client.pages.create({
        parent: { type: "database_id", database_id: ws.productsToWatchDatabaseId },
        properties: {
          Product: titleProp(r.title.slice(0, 255)),
          SKU: { rich_text: richText(r.sku ?? "") },
          Revenue: { number: r.revenue },
          Units: { number: r.unitsSold },
          Trend: { rich_text: richText(r.trendLabel) },
          Reason: { rich_text: richText(r.reason.slice(0, 1000)) }
        }
      });
      results.push({ targetId: page.id, action: "created" });
    }
    return results;
  }

  async createAlerts(records: NotionAlertRecord[]): Promise<NotionWriteResult[]> {
    const ws = await this.ensureWorkspaceStructure();
    const results: NotionWriteResult[] = [];
    for (const r of records) {
      const page = await this.client.pages.create({
        parent: { type: "database_id", database_id: ws.alertsDatabaseId },
        icon: {
          type: "emoji",
          emoji: r.severity === "critical" ? "🚨" : r.severity === "warning" ? "⚠️" : "ℹ️"
        },
        properties: {
          Title: titleProp(r.title.slice(0, 255)),
          Severity: { rich_text: richText(r.severity) },
          Body: { rich_text: richText(r.body.slice(0, 2000)) },
          "Created At": { date: { start: r.createdAt } }
        }
      });
      results.push({ targetId: page.id, action: "created" });
    }
    return results;
  }

  async syncDashboard(input: {
    report: WeeklyReport;
    kpis: NotionKpiRecord[];
    products: NotionProductWatchRecord[];
    alerts: NotionAlertRecord[];
    embedChatUrl?: string;
  }): Promise<NotionWriteResult> {
    const ws = await this.ensureWorkspaceStructure();
    const embedUrl = input.embedChatUrl ?? this.embedChatUrl;
    const blocks: BlockRequest[] = [
      {
        type: "callout",
        callout: {
          rich_text: richText(
            "✨ Notion MCP superpowers: Connect Notion MCP in Cursor, ChatGPT, or Claude. Then ask: \"What are my top products?\" • \"What needs restocking?\" • \"Summarize my store\" — your AI reads this workspace and answers from the data below."
          ),
          icon: { type: "emoji" as const, emoji: "🚀" },
          color: "green_background" as const
        }
      },
      ...(embedUrl
        ? [
            {
              type: "callout" as const,
              callout: {
                rich_text: richText(
                  `💬 Chat with AI from this page: Add an embed block and paste this URL: ${embedUrl}`
                ),
                icon: { type: "emoji" as const, emoji: "🤖" },
                color: "blue_background" as const
              }
            }
          ]
        : []),
      {
        type: "callout",
        callout: {
          rich_text: richText(input.report.executiveSummary),
          icon: { type: "emoji" as const, emoji: "📊" },
          color: "blue_background" as const
        }
      },
      {
        type: "heading_3",
        heading_3: { rich_text: richText("Latest KPIs") }
      },
      ...input.kpis.map((k) => ({
        type: "paragraph" as const,
        paragraph: {
          rich_text: richText(
            `${k.window}: $${k.revenue.toFixed(2)} • ${k.orders} orders • AOV $${k.averageOrderValue.toFixed(2)}`
          )
        }
      })),
      {
        type: "heading_3",
        heading_3: { rich_text: richText("Active Alerts") }
      },
      ...input.alerts.slice(0, 5).map((a) => ({
        type: "bulleted_list_item" as const,
        bulleted_list_item: {
          rich_text: richText(`[${a.severity}] ${a.title}: ${a.body.slice(0, 100)}`)
        }
      }))
    ];

    // @ts-expect-error BlockRequest matches Notion block schema; SDK types are strict
    await this.client.blocks.children.append({ block_id: ws.dashboardPageId, children: blocks });

    return { targetId: ws.dashboardPageId, action: "updated" };
  }
}
