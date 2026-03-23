import type {
  MerchantContext,
  ShopifyStoreSnapshot,
  WeeklyReport
} from "@notion-store-analyst/shared";
import {
  computeAlerts,
  computeInventoryRisks,
  computeKpis,
  computeProductPerformance
} from "./metrics";

export function buildWeeklyReport(
  snapshot: ShopifyStoreSnapshot,
  merchantContext: MerchantContext
): WeeklyReport {
  const kpiSnapshot = computeKpis(snapshot.orders, snapshot.windows);
  const sevenDayWindow = snapshot.windows.find((window) => window.label === "7d")!;
  const performance = computeProductPerformance(
    snapshot.orders,
    snapshot.products,
    merchantContext,
    sevenDayWindow.start,
    sevenDayWindow.end
  );
  const topWinners = performance.filter((row) => row.trendLabel === "winner").slice(0, 3);
  const productsAtRisk = performance.filter((row) => row.trendLabel === "risk").slice(0, 3);
  const inventoryRisks = computeInventoryRisks(snapshot.inventory);
  const alerts = computeAlerts(kpiSnapshot, topWinners, productsAtRisk, inventoryRisks, merchantContext);

  const priorityMessage =
    merchantContext.preferences.prioritySkus.length || merchantContext.preferences.priorityCollections.length
      ? `Priority products in Notion are influencing ranking for ${merchantContext.preferences.prioritySkus.join(", ") || merchantContext.preferences.priorityCollections.join(", ")}.`
      : "No priority products are set in Notion, so the report is using catalog-wide performance only.";

  return {
    slug: `${snapshot.shop.domain}-${sevenDayWindow.end.slice(0, 10)}`,
    generatedAt: new Date().toISOString(),
    executiveSummary: `Notion Store Analyst reviewed Shopify commerce data and tuned the narrative using the merchant's Notion workspace focus on ${merchantContext.preferences.businessFocus}.`,
    kpiSnapshot,
    whatChanged: [
      `The merchant's reporting tone is set to ${merchantContext.preferences.reportingTone} in Notion.`,
      priorityMessage,
      merchantContext.reporting.majorDropOnly
        ? "Alerts are filtered to major changes only, based on Notion preferences."
        : "Alerts include moderate shifts because the merchant requested broader visibility in Notion."
    ],
    topWinners,
    productsAtRisk,
    inventoryRisks,
    recommendedActions: [
      `Reinvest into ${topWinners[0]?.title ?? "the top-selling SKU"} while the current demand signal is strong.`,
      merchantContext.preferences.businessFocus.toLowerCase().includes("repeat")
        ? "Build an email and post-purchase flow aimed at second-order conversion."
        : "Validate whether acquisition-heavy spend is distorting margin efficiency.",
      inventoryRisks[0]
        ? `Restock ${inventoryRisks[0].title} before the next reporting cycle.`
        : "Inventory risk is contained; focus next on pricing and merchandising."
    ],
    notesBasedOnMerchantPriorities: [
      `Business focus from Notion: ${merchantContext.preferences.businessFocus}.`,
      `Reporting notes from Notion: ${merchantContext.preferences.summaryNotes}.`
    ],
    alerts
  };
}
