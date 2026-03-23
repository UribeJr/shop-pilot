import { buildWeeklyReport } from "@notion-store-analyst/analytics";
import { NotionMcpClient } from "@notion-store-analyst/notion-mcp";
import { getShopifyDataSource } from "@notion-store-analyst/shopify-client";
import type { AdapterMode, SyncSummary } from "@notion-store-analyst/shared";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getAppConfig } from "./config";
import { getPreferredInstallation } from "./shopify-oauth";

export async function runSync(explicitMode?: AdapterMode): Promise<SyncSummary> {
  const config = getAppConfig();
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get("notion-mcp-mode")?.value;
  const notionMode =
    explicitMode ?? (cookieMode === "mock" || cookieMode === "real" ? cookieMode : config.NOTION_MCP_MODE);
  const installation = await getPreferredInstallation();
  const shopifyRuntimeMode =
    installation?.accessToken || (config.SHOPIFY_ADMIN_ACCESS_TOKEN && config.SHOPIFY_SHOP_DOMAIN)
      ? "real"
      : "mock";
  const notion = new NotionMcpClient({
    mode: notionMode,
    baseUrl: config.NOTION_MCP_BASE_URL,
    apiKey: config.NOTION_API_KEY ?? config.NOTION_MCP_API_KEY,
    parentPageId: config.NOTION_PARENT_PAGE_ID,
    embedChatUrl: config.SHOPIFY_APP_URL ? `${config.SHOPIFY_APP_URL.replace(/\/$/, "")}/embed/chat` : undefined
  });
  const merchantContext = await notion.getMerchantContext();
  const snapshot = await getShopifyDataSource({
    mode: shopifyRuntimeMode,
    shopDomain: installation?.shopDomain ?? config.SHOPIFY_SHOP_DOMAIN,
    accessToken: installation?.accessToken ?? config.SHOPIFY_ADMIN_ACCESS_TOKEN
  });
  const report = buildWeeklyReport(snapshot, merchantContext);
  const syncPayload = await notion.syncWorkspace({
    storeDomain: snapshot.shop.domain,
    merchantContext,
    report
  });

  const store = await prisma.store.upsert({
    where: { shopDomain: snapshot.shop.domain },
    update: {
      shopName: snapshot.shop.name,
      currencyCode: snapshot.shop.currencyCode,
      planDisplayName: snapshot.shop.planDisplayName
    },
    create: {
      shopDomain: snapshot.shop.domain,
      shopName: snapshot.shop.name,
      currencyCode: snapshot.shop.currencyCode,
      planDisplayName: snapshot.shop.planDisplayName
    }
  });

  await prisma.shopifyInstallation.upsert({
    where: { shopDomain: snapshot.shop.domain },
    update: {
      accessToken: installation?.accessToken ?? config.SHOPIFY_ADMIN_ACCESS_TOKEN,
      shopDomain: snapshot.shop.domain,
      scopes: config.SHOPIFY_SCOPES,
      appBridgeEnabled: true
    },
    create: {
      storeId: store.id,
      shopDomain: snapshot.shop.domain,
      accessToken: installation?.accessToken ?? config.SHOPIFY_ADMIN_ACCESS_TOKEN,
      scopes: config.SHOPIFY_SCOPES,
      appBridgeEnabled: true
    }
  });

  await prisma.notionWorkspaceConnection.upsert({
    where: { storeId: store.id },
    update: {
      workspaceId: "workspace-live-or-mock",
      workspaceName: merchantContext.workspaceName,
      adapterMode: notionMode,
      lastSyncedAt: new Date(report.generatedAt),
      preferencesPageId: syncPayload.workspace.preferencesPageId,
      merchantContextJson: JSON.stringify(merchantContext),
      workspaceStructureJson: JSON.stringify(syncPayload.workspace)
    },
    create: {
      storeId: store.id,
      workspaceId: "workspace-live-or-mock",
      workspaceName: merchantContext.workspaceName,
      adapterMode: notionMode,
      lastSyncedAt: new Date(report.generatedAt),
      preferencesPageId: syncPayload.workspace.preferencesPageId,
      merchantContextJson: JSON.stringify(merchantContext),
      workspaceStructureJson: JSON.stringify(syncPayload.workspace)
    }
  });

  await prisma.kPIRecord.deleteMany({ where: { storeId: store.id } });
  await prisma.productSnapshot.deleteMany({ where: { storeId: store.id } });
  await prisma.alert.deleteMany({ where: { storeId: store.id } });

  await prisma.kPIRecord.createMany({
    data: syncPayload.kpiRecords.map((record) => ({
      storeId: store.id,
      date: new Date(record.date),
      window: record.window,
      revenue: record.revenue,
      orders: record.orders,
      averageOrderValue: record.averageOrderValue,
      repeatCustomerRate: record.repeatCustomerRate
    }))
  });

  await prisma.productSnapshot.createMany({
    data: syncPayload.productsToWatch.map((record) => ({
      storeId: store.id,
      externalId: record.productId,
      title: record.title,
      sku: record.sku ?? null,
      revenue: record.revenue,
      unitsSold: record.unitsSold,
      trendLabel: record.trendLabel,
      reason: record.reason,
      priorityHit: record.priorityHit
    }))
  });

  await prisma.alert.createMany({
    data: syncPayload.alertRecords.map((record, index) => ({
      storeId: store.id,
      code: `${record.severity}-${index}`,
      severity: record.severity,
      title: record.title,
      body: record.body
    }))
  });

  await prisma.weeklyReport.upsert({
    where: { slug: report.slug },
    update: {
      generatedAt: new Date(report.generatedAt),
      executiveSummary: report.executiveSummary,
      recommendedActions: JSON.stringify(report.recommendedActions),
      rawJson: JSON.stringify(report, null, 2)
    },
    create: {
      storeId: store.id,
      slug: report.slug,
      generatedAt: new Date(report.generatedAt),
      executiveSummary: report.executiveSummary,
      recommendedActions: JSON.stringify(report.recommendedActions),
      rawJson: JSON.stringify(report, null, 2)
    }
  });

  await prisma.syncRun.create({
    data: {
      storeId: store.id,
      adapterMode: notionMode,
      status: "success",
      startedAt: new Date(),
      completedAt: new Date(report.generatedAt),
      sourceWindow: snapshot.windows.map((window) => window.label).join(","),
      reportSlug: report.slug,
      ordersCount: snapshot.orders.length,
      productsCount: snapshot.products.length,
      customersCount: snapshot.customers.length,
      alertsCount: syncPayload.alertRecords.length,
      payloadPreview: JSON.stringify(syncPayload.payloadPreview, null, 2)
    }
  });

  return {
    storeDomain: snapshot.shop.domain,
    adapterMode: notionMode,
    merchantContext,
    workspace: syncPayload.workspace,
    report,
    kpiRecords: syncPayload.kpiRecords,
    productsToWatch: syncPayload.productsToWatch,
    alertRecords: syncPayload.alertRecords,
    payloadPreview: syncPayload.payloadPreview
  };
}

export async function getLatestSummary(): Promise<SyncSummary | null> {
  // Prefer the installed store's data (e.g. gameness) over seed/demo stores
  const installed = await prisma.shopifyInstallation.findFirst({
    where: { uninstalledAt: null, accessToken: { not: null } },
    orderBy: { updatedAt: "desc" }
  });
  const preferredDomain = installed?.shopDomain;

  let latestStore = await prisma.store.findFirst({
    where: preferredDomain ? { shopDomain: preferredDomain } : undefined,
    include: {
      notionConnection: true,
      kpiRecords: { orderBy: { date: "desc" } },
      productSnapshots: { orderBy: { revenue: "desc" } },
      alerts: { orderBy: { createdAt: "desc" } },
      weeklyReports: { orderBy: { generatedAt: "desc" } },
      syncRuns: { orderBy: { completedAt: "desc" }, take: 1 }
    }
  });

  if (!latestStore?.weeklyReports[0] || !latestStore.notionConnection) {
    latestStore = await prisma.store.findFirst({
      include: {
        notionConnection: true,
        kpiRecords: { orderBy: { date: "desc" } },
        productSnapshots: { orderBy: { revenue: "desc" } },
        alerts: { orderBy: { createdAt: "desc" } },
        weeklyReports: { orderBy: { generatedAt: "desc" } },
        syncRuns: { orderBy: { completedAt: "desc" }, take: 1 }
      }
    });
  }

  if (!latestStore?.weeklyReports[0] || !latestStore.notionConnection) {
    return null;
  }

  const report = JSON.parse(latestStore.weeklyReports[0].rawJson);
  const payloadPreview = latestStore.syncRuns[0]?.payloadPreview
    ? JSON.parse(latestStore.syncRuns[0].payloadPreview)
    : {
        dashboard: {},
        weeklyReport: {},
        kpiHistory: [],
        productsToWatch: [],
        alerts: []
      };
  const merchantContext = latestStore.notionConnection.merchantContextJson
    ? JSON.parse(latestStore.notionConnection.merchantContextJson)
    : {
        workspaceName: latestStore.notionConnection.workspaceName,
        dashboardPageId: "restored-dashboard",
        preferencesPageId: latestStore.notionConnection.preferencesPageId ?? undefined,
        preferences: {
          businessFocus: "Restored from seed sync",
          reportingTone: "operator",
          alertThreshold: 0.2,
          prioritySkus: [],
          priorityCollections: [],
          summaryNotes: "Seeded summary"
        },
        reporting: {
          includeInventoryRisks: true,
          includeUnderperformers: true,
          majorDropOnly: true
        }
      };
  const workspace = latestStore.notionConnection.workspaceStructureJson
    ? JSON.parse(latestStore.notionConnection.workspaceStructureJson)
    : {
        dashboardPageId: "restored-dashboard",
        weeklyReportsDatabaseId: "restored-reports",
        kpiHistoryDatabaseId: "restored-kpis",
        productsToWatchDatabaseId: "restored-products",
        alertsDatabaseId: "restored-alerts",
        preferencesPageId: latestStore.notionConnection.preferencesPageId ?? undefined
      };

  return {
    storeDomain: latestStore.shopDomain,
    adapterMode: latestStore.notionConnection.adapterMode as AdapterMode,
    merchantContext,
    workspace,
    report,
    kpiRecords: latestStore.kpiRecords.map((record) => ({
      date: record.date.toISOString(),
      window: record.window as "7d" | "30d",
      revenue: record.revenue,
      orders: record.orders,
      averageOrderValue: record.averageOrderValue,
      repeatCustomerRate: record.repeatCustomerRate
    })),
    productsToWatch: latestStore.productSnapshots.map((record) => ({
      productId: record.externalId,
      title: record.title,
      sku: record.sku ?? undefined,
      revenue: record.revenue,
      unitsSold: record.unitsSold,
      reason: record.reason,
      trendLabel: record.trendLabel as "winner" | "watch" | "risk",
      priorityHit: record.priorityHit
    })),
    alertRecords: latestStore.alerts.map((record) => ({
      createdAt: record.createdAt.toISOString(),
      severity: record.severity as "info" | "warning" | "critical",
      title: record.title,
      body: record.body
    })),
    payloadPreview
  };
}
