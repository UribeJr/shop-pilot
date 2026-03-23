import type {
  AnalyticsAlert,
  InventoryRisk,
  KpiSnapshot,
  MerchantContext,
  ProductPerformance,
  ShopifyInventorySnapshot,
  ShopifyOrderSnapshot,
  ShopifyProductSnapshot
} from "@notion-store-analyst/shared";
import { DEFAULT_ALERT_THRESHOLD } from "@notion-store-analyst/shared";

function withinWindow(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function safeDivide(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

export function computeKpis(
  orders: ShopifyOrderSnapshot[],
  windows: Array<{ label: "7d" | "30d"; start: string; end: string }>
): KpiSnapshot[] {
  return windows.map((window) => {
    const ordersInWindow = orders.filter(
      (order) => order.paid && withinWindow(order.createdAt, window.start, window.end)
    );
    const revenue = ordersInWindow.reduce((sum, order) => sum + order.totalPrice.amount, 0);
    const repeatCustomerIds = new Set(
      ordersInWindow
        .filter((order) => order.customerId)
        .filter((order) => orders.filter((candidate) => candidate.customerId === order.customerId).length > 1)
        .map((order) => order.customerId as string)
    );
    const totalCustomerIds = new Set(
      ordersInWindow.filter((order) => order.customerId).map((order) => order.customerId as string)
    );

    return {
      window: window.label,
      revenue,
      orders: ordersInWindow.length,
      averageOrderValue: safeDivide(revenue, ordersInWindow.length),
      repeatCustomerRate: safeDivide(repeatCustomerIds.size, totalCustomerIds.size)
    };
  });
}

export function computeProductPerformance(
  orders: ShopifyOrderSnapshot[],
  products: ShopifyProductSnapshot[],
  merchantContext: MerchantContext,
  start: string,
  end: string
): ProductPerformance[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const stats = new Map<
    string,
    { revenue: number; unitsSold: number; sku?: string | null; title: string; priorityHit: boolean }
  >();

  for (const order of orders) {
    if (!order.paid || !withinWindow(order.createdAt, start, end)) continue;
    for (const item of order.lineItems) {
      const product = productMap.get(item.productId);
      const priorityHit =
        merchantContext.preferences.prioritySkus.includes(item.sku ?? "") ||
        (product?.collectionTitles ?? []).some((title) =>
          merchantContext.preferences.priorityCollections.includes(title)
        );
      const existing = stats.get(item.productId) ?? {
        revenue: 0,
        unitsSold: 0,
        sku: item.sku,
        title: item.title,
        priorityHit
      };
      existing.revenue += item.price * item.quantity;
      existing.unitsSold += item.quantity;
      existing.priorityHit = existing.priorityHit || priorityHit;
      stats.set(item.productId, existing);
    }
  }

  const rows = [...stats.entries()].map(([productId, value]) => ({
    productId,
    title: value.title,
    sku: value.sku,
    revenue: value.revenue,
    unitsSold: value.unitsSold,
    trendLabel: "watch" as const,
    reason: "",
    priorityHit: value.priorityHit
  }));

  const averageRevenue = safeDivide(
    rows.reduce((sum, row) => sum + row.revenue, 0),
    rows.length
  );

  return rows
    .map((row) => {
      if (row.revenue >= averageRevenue * 1.25 || row.priorityHit) {
        return {
          ...row,
          trendLabel: "winner" as const,
          reason: row.priorityHit
            ? "Matches merchant priorities in Notion and is converting."
            : "Revenue and units sold are outperforming the catalog average."
        };
      }

      if (row.revenue <= averageRevenue * 0.55) {
        return {
          ...row,
          trendLabel: "risk" as const,
          reason: "Revenue is materially below the catalog average for the selected window."
        };
      }

      return {
        ...row,
        trendLabel: "watch" as const,
        reason: "Stable performance, but not yet clearly winning or failing."
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeInventoryRisks(inventory: ShopifyInventorySnapshot[]): InventoryRisk[] {
  return inventory
    .filter((entry) => entry.available <= entry.threshold)
    .map((entry) => ({
      productId: entry.productId,
      title: entry.title,
      sku: entry.sku,
      available: entry.available,
      threshold: entry.threshold,
      riskLevel: (entry.available <= Math.floor(entry.threshold / 2) ? "critical" : "low") as
        | "low"
        | "critical",
      reason:
        entry.available <= Math.floor(entry.threshold / 2)
          ? "Stock is below half the merchant-defined threshold."
          : "Stock has crossed the merchant-defined warning threshold."
    }))
    .sort((a, b) => a.available - b.available);
}

export function computeAlerts(
  kpis: KpiSnapshot[],
  winners: ProductPerformance[],
  risks: ProductPerformance[],
  inventoryRisks: InventoryRisk[],
  merchantContext: MerchantContext
): AnalyticsAlert[] {
  const sevenDay = kpis.find((kpi) => kpi.window === "7d");
  const thirtyDay = kpis.find((kpi) => kpi.window === "30d");
  const threshold =
    merchantContext.reporting.majorDropOnly
      ? Math.max(merchantContext.preferences.alertThreshold, DEFAULT_ALERT_THRESHOLD)
      : merchantContext.preferences.alertThreshold;
  const alerts: AnalyticsAlert[] = [];

  if (sevenDay && thirtyDay) {
    const baselineWeeklyRevenue = thirtyDay.revenue / 4.2857;
    const drop = safeDivide(baselineWeeklyRevenue - sevenDay.revenue, baselineWeeklyRevenue);

    if (drop >= threshold) {
      alerts.push({
        code: "revenue-drop",
        severity: drop >= threshold * 1.5 ? "critical" : "warning",
        title: "Revenue fell below the expected weekly run-rate",
        body: `Last 7 days revenue is ${(drop * 100).toFixed(1)}% below the 30-day weekly baseline.`
      });
    }
  }

  for (const risk of risks.slice(0, 2)) {
    alerts.push({
      code: `product-risk-${risk.productId}`,
      severity: risk.priorityHit ? "critical" : "warning",
      title: `${risk.title} is underperforming`,
      body: risk.reason
    });
  }

  for (const risk of inventoryRisks.slice(0, 2)) {
    alerts.push({
      code: `inventory-${risk.productId}`,
      severity: risk.riskLevel === "critical" ? "critical" : "info",
      title: `${risk.title} is nearing stockout`,
      body: risk.reason
    });
  }

  if (winners[0]) {
    alerts.push({
      code: `winner-${winners[0].productId}`,
      severity: "info",
      title: `${winners[0].title} is a current winner`,
      body: winners[0].reason
    });
  }

  return alerts;
}
