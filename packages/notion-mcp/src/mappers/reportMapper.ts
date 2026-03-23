import type { MerchantContext, WeeklyReport } from "@notion-store-analyst/shared";

export function mapWeeklyReportToNotionPayload(
  report: WeeklyReport,
  merchantContext: MerchantContext
) {
  return {
    title: `Weekly Report • ${new Date(report.generatedAt).toLocaleDateString("en-US")}`,
    icon: "chart-line",
    sections: [
      {
        heading: "Executive Summary",
        body: report.executiveSummary
      },
      {
        heading: "KPI Snapshot",
        body: report.kpiSnapshot.map((kpi) => ({
          window: kpi.window,
          revenue: Number(kpi.revenue.toFixed(2)),
          orders: kpi.orders,
          averageOrderValue: Number(kpi.averageOrderValue.toFixed(2)),
          repeatCustomerRate: Number((kpi.repeatCustomerRate * 100).toFixed(1))
        }))
      },
      {
        heading: "What Changed",
        body: report.whatChanged
      },
      {
        heading: "Top Winners",
        body: report.topWinners
      },
      {
        heading: "Products At Risk",
        body: report.productsAtRisk
      },
      {
        heading: "Inventory Risks",
        body: report.inventoryRisks
      },
      {
        heading: "Recommended Actions",
        body: report.recommendedActions
      },
      {
        heading: "Notes Based on Merchant Priorities",
        body: [
          ...report.notesBasedOnMerchantPriorities,
          `Tone requested in Notion: ${merchantContext.preferences.reportingTone}`
        ]
      }
    ]
  };
}
