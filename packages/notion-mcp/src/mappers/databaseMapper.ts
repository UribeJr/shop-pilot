import type {
  NotionAlertRecord,
  NotionKpiRecord,
  NotionProductWatchRecord
} from "@notion-store-analyst/shared";

export function mapKpiRecords(records: NotionKpiRecord[]) {
  return records.map((record) => ({
    Date: record.date,
    Window: record.window,
    Revenue: Number(record.revenue.toFixed(2)),
    Orders: record.orders,
    AOV: Number(record.averageOrderValue.toFixed(2)),
    RepeatCustomerRate: Number((record.repeatCustomerRate * 100).toFixed(1))
  }));
}

export function mapProductsToWatch(records: NotionProductWatchRecord[]) {
  return records.map((record) => ({
    ProductId: record.productId,
    Title: record.title,
    SKU: record.sku ?? "",
    Revenue: Number(record.revenue.toFixed(2)),
    UnitsSold: record.unitsSold,
    Trend: record.trendLabel,
    Reason: record.reason,
    PriorityHit: record.priorityHit
  }));
}

export function mapAlertRecords(records: NotionAlertRecord[]) {
  return records.map((record) => ({
    CreatedAt: record.createdAt,
    Severity: record.severity,
    Title: record.title,
    Body: record.body
  }));
}
