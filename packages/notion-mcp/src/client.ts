import type {
  AdapterMode,
  MerchantContext,
  NotionAlertRecord,
  NotionKpiRecord,
  NotionProductWatchRecord,
  SyncSummary,
  WeeklyReport
} from "@notion-store-analyst/shared";
import { mapAlertRecords, mapKpiRecords, mapProductsToWatch } from "./mappers/databaseMapper";
import { mapWeeklyReportToNotionPayload } from "./mappers/reportMapper";
import { MockNotionMcpAdapter } from "./adapters/mockNotionMcpAdapter";
import { NotionApiAdapter } from "./adapters/notionApiAdapter";
import { RealNotionMcpAdapter } from "./adapters/realNotionMcpAdapter";
import type { NotionMcpAdapter } from "./types";

export type NotionMcpClientOptions = {
  mode: AdapterMode;
  baseUrl?: string;
  apiKey?: string;
  parentPageId?: string;
  embedChatUrl?: string;
};

export class NotionMcpClient {
  private readonly adapter: NotionMcpAdapter;

  constructor(private readonly options: NotionMcpClientOptions) {
    if (options.mode === "real" && options.apiKey && options.parentPageId) {
      this.adapter = new NotionApiAdapter({
        apiKey: options.apiKey,
        parentPageId: options.parentPageId,
        embedChatUrl: options.embedChatUrl
      });
    } else if (options.mode === "real" && options.baseUrl && options.apiKey) {
      this.adapter = new RealNotionMcpAdapter({ baseUrl: options.baseUrl, apiKey: options.apiKey });
    } else {
      this.adapter = new MockNotionMcpAdapter();
    }
  }

  async connectWorkspace() {
    return this.adapter.connectWorkspace();
  }

  async getMerchantContext(): Promise<MerchantContext> {
    return this.adapter.getMerchantContext();
  }

  async getReportingPreferences() {
    return this.adapter.getReportingPreferences();
  }

  async getPriorityProducts() {
    return this.adapter.getPriorityProducts();
  }

  async ensureWorkspaceStructure() {
    return this.adapter.ensureWorkspaceStructure();
  }

  async syncWorkspace(input: {
    storeDomain: string;
    merchantContext: MerchantContext;
    report: WeeklyReport;
  }): Promise<Pick<SyncSummary, "workspace" | "payloadPreview" | "kpiRecords" | "productsToWatch" | "alertRecords">> {
    const workspace = await this.adapter.ensureWorkspaceStructure();
    const kpiRecords: NotionKpiRecord[] = input.report.kpiSnapshot.map((kpi) => ({
      date: input.report.generatedAt,
      window: kpi.window,
      revenue: kpi.revenue,
      orders: kpi.orders,
      averageOrderValue: kpi.averageOrderValue,
      repeatCustomerRate: kpi.repeatCustomerRate
    }));
    const productsToWatch: NotionProductWatchRecord[] = [
      ...input.report.topWinners,
      ...input.report.productsAtRisk
    ].map((product) => ({
      productId: product.productId,
      title: product.title,
      sku: product.sku,
      revenue: product.revenue,
      unitsSold: product.unitsSold,
      reason: product.reason,
      trendLabel: product.trendLabel,
      priorityHit: product.priorityHit
    }));
    const alertRecords: NotionAlertRecord[] = input.report.alerts.map((alert) => ({
      createdAt: input.report.generatedAt,
      severity: alert.severity,
      title: alert.title,
      body: alert.body
    }));

    await this.adapter.createWeeklyReport(input.report);
    await this.adapter.upsertKpiRecords(kpiRecords);
    await this.adapter.upsertProductsToWatch(productsToWatch);
    await this.adapter.createAlerts(alertRecords);
    await this.adapter.syncDashboard({
      report: input.report,
      kpis: kpiRecords,
      products: productsToWatch,
      alerts: alertRecords,
      embedChatUrl: this.options.embedChatUrl
    });

    return {
      workspace,
      kpiRecords,
      productsToWatch,
      alertRecords,
      payloadPreview: {
        dashboard: {
          storeDomain: input.storeDomain,
          generatedAt: input.report.generatedAt,
          executiveSummary: input.report.executiveSummary,
          alerts: input.report.alerts
        },
        weeklyReport: mapWeeklyReportToNotionPayload(input.report, input.merchantContext),
        kpiHistory: mapKpiRecords(kpiRecords),
        productsToWatch: mapProductsToWatch(productsToWatch),
        alerts: mapAlertRecords(alertRecords)
      }
    };
  }
}
