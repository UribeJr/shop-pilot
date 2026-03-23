import { PrismaClient } from "@prisma/client";
import { buildWeeklyReport } from "@notion-store-analyst/analytics";
import { NotionMcpClient } from "@notion-store-analyst/notion-mcp";
import { getDemoShopifySnapshot } from "@notion-store-analyst/shopify-client";

const prisma = new PrismaClient();

async function main() {
  const snapshot = getDemoShopifySnapshot();
  const notion = new NotionMcpClient({ mode: "mock" });
  const merchantContext = await notion.getMerchantContext();
  const report = buildWeeklyReport(snapshot, merchantContext);

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
      planDisplayName: snapshot.shop.planDisplayName,
      installation: {
        create: {
          shopDomain: snapshot.shop.domain,
          scopes: "read_orders,read_products,read_customers,read_inventory",
          appBridgeEnabled: true
        }
      },
      notionConnection: {
        create: {
          workspaceId: "mock-workspace",
          workspaceName: merchantContext.workspaceName,
          adapterMode: "mock",
          preferencesPageId: merchantContext.preferencesPageId,
          merchantContextJson: JSON.stringify(merchantContext),
          workspaceStructureJson: JSON.stringify({
            dashboardPageId: "mock-dashboard-page",
            weeklyReportsDatabaseId: "mock-weekly-reports-db",
            kpiHistoryDatabaseId: "mock-kpi-history-db",
            productsToWatchDatabaseId: "mock-products-watch-db",
            alertsDatabaseId: "mock-alerts-db",
            preferencesPageId: "mock-preferences-page"
          })
        }
      }
    }
  });

  await prisma.kPIRecord.deleteMany({ where: { storeId: store.id } });
  await prisma.productSnapshot.deleteMany({ where: { storeId: store.id } });
  await prisma.alert.deleteMany({ where: { storeId: store.id } });
  await prisma.weeklyReport.deleteMany({ where: { storeId: store.id } });
  await prisma.syncRun.deleteMany({ where: { storeId: store.id } });

  await prisma.kPIRecord.createMany({
    data: report.kpiSnapshot.map((kpi) => ({
      storeId: store.id,
      date: new Date(report.generatedAt),
      window: kpi.window,
      revenue: kpi.revenue,
      orders: kpi.orders,
      averageOrderValue: kpi.averageOrderValue,
      repeatCustomerRate: kpi.repeatCustomerRate
    }))
  });

  await prisma.productSnapshot.createMany({
    data: [...report.topWinners, ...report.productsAtRisk].map((product) => ({
      storeId: store.id,
      externalId: product.productId,
      title: product.title,
      sku: product.sku ?? null,
      revenue: product.revenue,
      unitsSold: product.unitsSold,
      trendLabel: product.trendLabel,
      reason: product.reason,
      priorityHit: product.priorityHit
    }))
  });

  await prisma.alert.createMany({
    data: report.alerts.map((alert) => ({
      storeId: store.id,
      code: alert.code,
      severity: alert.severity,
      title: alert.title,
      body: alert.body
    }))
  });

  await prisma.weeklyReport.create({
    data: {
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
      adapterMode: "mock",
      status: "success",
      completedAt: new Date(report.generatedAt),
      sourceWindow: "7d,30d",
      reportSlug: report.slug,
      ordersCount: snapshot.orders.length,
      productsCount: snapshot.products.length,
      customersCount: snapshot.customers.length,
      alertsCount: report.alerts.length,
      payloadPreview: JSON.stringify(
        {
          reportSlug: report.slug,
          executiveSummary: report.executiveSummary
        },
        null,
        2
      )
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
