export type AdapterMode = "mock" | "real";

export type DateWindow = {
  label: "7d" | "30d";
  start: string;
  end: string;
};

export type MerchantPreferences = {
  businessFocus: string;
  reportingTone: "concise" | "operator" | "executive";
  alertThreshold: number;
  prioritySkus: string[];
  priorityCollections: string[];
  summaryNotes: string;
};

export type ReportingPreferences = {
  includeInventoryRisks: boolean;
  includeUnderperformers: boolean;
  majorDropOnly: boolean;
};

export type MerchantContext = {
  workspaceName: string;
  dashboardPageId?: string;
  preferencesPageId?: string;
  preferences: MerchantPreferences;
  reporting: ReportingPreferences;
};

export type ShopifyMoney = {
  amount: number;
  currencyCode: string;
};

export type ShopifyCustomerSnapshot = {
  id: string;
  email: string | null;
  displayName: string;
  ordersCount: number;
};

export type ShopifyLineItemSnapshot = {
  productId: string;
  variantId?: string | null;
  title: string;
  sku?: string | null;
  quantity: number;
  price: number;
};

export type ShopifyOrderSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  paid: boolean;
  totalPrice: ShopifyMoney;
  customerId?: string | null;
  customerEmail?: string | null;
  lineItems: ShopifyLineItemSnapshot[];
};

export type ShopifyInventorySnapshot = {
  productId: string;
  variantId?: string | null;
  sku?: string | null;
  title: string;
  available: number;
  threshold: number;
};

export type ShopifyProductSnapshot = {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor?: string | null;
  featured: boolean;
  collectionTitles: string[];
  variants: Array<{
    id: string;
    title: string;
    sku?: string | null;
    price: number;
  }>;
};

export type ShopifyStoreSnapshot = {
  shop: {
    id: string;
    name: string;
    domain: string;
    currencyCode: string;
    planDisplayName?: string | null;
  };
  windows: DateWindow[];
  orders: ShopifyOrderSnapshot[];
  products: ShopifyProductSnapshot[];
  customers: ShopifyCustomerSnapshot[];
  inventory: ShopifyInventorySnapshot[];
};

export type KpiSnapshot = {
  window: "7d" | "30d";
  revenue: number;
  orders: number;
  averageOrderValue: number;
  repeatCustomerRate: number;
};

export type ProductPerformance = {
  productId: string;
  title: string;
  sku?: string | null;
  revenue: number;
  unitsSold: number;
  trendLabel: "winner" | "watch" | "risk";
  reason: string;
  priorityHit: boolean;
};

export type InventoryRisk = {
  productId: string;
  title: string;
  sku?: string | null;
  available: number;
  threshold: number;
  riskLevel: "low" | "critical";
  reason: string;
};

export type AnalyticsAlert = {
  code: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
};

export type WeeklyReport = {
  slug: string;
  generatedAt: string;
  executiveSummary: string;
  kpiSnapshot: KpiSnapshot[];
  whatChanged: string[];
  topWinners: ProductPerformance[];
  productsAtRisk: ProductPerformance[];
  inventoryRisks: InventoryRisk[];
  recommendedActions: string[];
  notesBasedOnMerchantPriorities: string[];
  alerts: AnalyticsAlert[];
};

export type WorkspaceStructure = {
  dashboardPageId: string;
  weeklyReportsDatabaseId: string;
  kpiHistoryDatabaseId: string;
  productsToWatchDatabaseId: string;
  alertsDatabaseId: string;
  preferencesPageId?: string;
};

export type NotionKpiRecord = {
  date: string;
  window: "7d" | "30d";
  revenue: number;
  orders: number;
  averageOrderValue: number;
  repeatCustomerRate: number;
};

export type NotionProductWatchRecord = {
  productId: string;
  title: string;
  sku?: string | null;
  revenue: number;
  unitsSold: number;
  reason: string;
  trendLabel: "winner" | "watch" | "risk";
  priorityHit: boolean;
};

export type NotionAlertRecord = {
  createdAt: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
};

export type NotionWriteResult = {
  targetId: string;
  action: "created" | "updated";
};

export type SyncSummary = {
  storeDomain: string;
  adapterMode: AdapterMode;
  merchantContext: MerchantContext;
  workspace: WorkspaceStructure;
  report: WeeklyReport;
  kpiRecords: NotionKpiRecord[];
  productsToWatch: NotionProductWatchRecord[];
  alertRecords: NotionAlertRecord[];
  payloadPreview: {
    dashboard: Record<string, unknown>;
    weeklyReport: Record<string, unknown>;
    kpiHistory: Record<string, unknown>[];
    productsToWatch: Record<string, unknown>[];
    alerts: Record<string, unknown>[];
  };
};
