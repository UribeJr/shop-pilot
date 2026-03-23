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

type RealAdapterOptions = {
  baseUrl?: string;
  apiKey?: string;
};

export class RealNotionMcpAdapter implements NotionMcpAdapter {
  constructor(private readonly options: RealAdapterOptions) {}

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    if (!this.options.baseUrl || !this.options.apiKey) {
      throw new Error(
        "Real Notion MCP adapter is selected, but NOTION_MCP_BASE_URL or NOTION_MCP_API_KEY is missing."
      );
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Notion MCP request failed with ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }

  async connectWorkspace(): Promise<WorkspaceConnectionResult> {
    return this.post("/connect", {});
  }

  async getMerchantContext(): Promise<MerchantContext> {
    return this.post("/merchant-context", {});
  }

  async getReportingPreferences(): Promise<MerchantContext["reporting"]> {
    return this.post("/reporting-preferences", {});
  }

  async getPriorityProducts(): Promise<string[]> {
    return this.post("/priority-products", {});
  }

  async ensureWorkspaceStructure(): Promise<WorkspaceStructure> {
    return this.post("/workspace/ensure", {});
  }

  async createWeeklyReport(report: WeeklyReport): Promise<NotionWriteResult> {
    return this.post("/reports/weekly", { report });
  }

  async upsertKpiRecords(records: NotionKpiRecord[]): Promise<NotionWriteResult[]> {
    return this.post("/kpis/upsert", { records });
  }

  async upsertProductsToWatch(records: NotionProductWatchRecord[]): Promise<NotionWriteResult[]> {
    return this.post("/products/watch/upsert", { records });
  }

  async createAlerts(records: NotionAlertRecord[]): Promise<NotionWriteResult[]> {
    return this.post("/alerts/create", { records });
  }

  async syncDashboard(input: {
    report: WeeklyReport;
    kpis: NotionKpiRecord[];
    products: NotionProductWatchRecord[];
    alerts: NotionAlertRecord[];
  }): Promise<NotionWriteResult> {
    return this.post("/dashboard/sync", input);
  }
}
