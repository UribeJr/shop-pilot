import type {
  MerchantContext,
  NotionAlertRecord,
  NotionKpiRecord,
  NotionProductWatchRecord,
  NotionWriteResult,
  WeeklyReport,
  WorkspaceStructure
} from "@notion-store-analyst/shared";

export type WorkspaceConnectionResult = {
  workspaceId: string;
  workspaceName: string;
  mode: "mock" | "real";
};

export interface NotionMcpAdapter {
  connectWorkspace(): Promise<WorkspaceConnectionResult>;
  getMerchantContext(): Promise<MerchantContext>;
  getReportingPreferences(): Promise<MerchantContext["reporting"]>;
  getPriorityProducts(): Promise<string[]>;
  ensureWorkspaceStructure(): Promise<WorkspaceStructure>;
  createWeeklyReport(report: WeeklyReport): Promise<NotionWriteResult>;
  upsertKpiRecords(records: NotionKpiRecord[]): Promise<NotionWriteResult[]>;
  upsertProductsToWatch(records: NotionProductWatchRecord[]): Promise<NotionWriteResult[]>;
  createAlerts(records: NotionAlertRecord[]): Promise<NotionWriteResult[]>;
  syncDashboard(input: {
    report: WeeklyReport;
    kpis: NotionKpiRecord[];
    products: NotionProductWatchRecord[];
    alerts: NotionAlertRecord[];
    embedChatUrl?: string;
  }): Promise<NotionWriteResult>;
}
