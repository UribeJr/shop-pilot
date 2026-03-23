import type {
  MerchantContext,
  NotionAlertRecord,
  NotionKpiRecord,
  NotionProductWatchRecord,
  WeeklyReport,
  WorkspaceStructure
} from "@notion-store-analyst/shared";
import type { NotionMcpAdapter, WorkspaceConnectionResult } from "../types";

export class MockNotionMcpAdapter implements NotionMcpAdapter {
  private readonly merchantContext: MerchantContext;
  private readonly workspace: WorkspaceStructure;

  constructor(input?: Partial<MerchantContext>) {
    this.merchantContext = {
      workspaceName: "Northstar Goods Workspace",
      dashboardPageId: "mock-dashboard-page",
      preferencesPageId: "mock-preferences-page",
      preferences: {
        businessFocus: "Focus on repeat purchases and spring collection sell-through",
        reportingTone: "operator",
        alertThreshold: 0.2,
        prioritySkus: ["SPR-001", "SPR-004"],
        priorityCollections: ["Spring Collection"],
        summaryNotes: "Alert me only for major revenue drops and keep recommendations operational."
      },
      reporting: {
        includeInventoryRisks: true,
        includeUnderperformers: true,
        majorDropOnly: true
      },
      ...input
    };
    this.workspace = {
      dashboardPageId: "mock-dashboard-page",
      weeklyReportsDatabaseId: "mock-weekly-reports-db",
      kpiHistoryDatabaseId: "mock-kpi-history-db",
      productsToWatchDatabaseId: "mock-products-watch-db",
      alertsDatabaseId: "mock-alerts-db",
      preferencesPageId: "mock-preferences-page"
    };
  }

  async connectWorkspace(): Promise<WorkspaceConnectionResult> {
    return {
      workspaceId: "mock-workspace",
      workspaceName: this.merchantContext.workspaceName,
      mode: "mock"
    };
  }

  async getMerchantContext() {
    return this.merchantContext;
  }

  async getReportingPreferences() {
    return this.merchantContext.reporting;
  }

  async getPriorityProducts() {
    return this.merchantContext.preferences.prioritySkus;
  }

  async ensureWorkspaceStructure() {
    return this.workspace;
  }

  async createWeeklyReport(_report: WeeklyReport) {
    return { targetId: this.workspace.weeklyReportsDatabaseId, action: "created" as const };
  }

  async upsertKpiRecords(records: NotionKpiRecord[]) {
    return records.map((record) => ({
      targetId: `${this.workspace.kpiHistoryDatabaseId}:${record.window}:${record.date}`,
      action: "updated" as const
    }));
  }

  async upsertProductsToWatch(records: NotionProductWatchRecord[]) {
    return records.map((record) => ({
      targetId: `${this.workspace.productsToWatchDatabaseId}:${record.productId}`,
      action: "updated" as const
    }));
  }

  async createAlerts(records: NotionAlertRecord[]) {
    return records.map((record, index) => ({
      targetId: `${this.workspace.alertsDatabaseId}:${index}:${record.severity}`,
      action: "created" as const
    }));
  }

  async syncDashboard() {
    return { targetId: this.workspace.dashboardPageId, action: "updated" as const };
  }
}
