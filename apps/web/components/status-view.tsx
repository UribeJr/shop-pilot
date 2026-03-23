"use client";

import { Badge, BlockStack, Card, List, Text } from "@shopify/polaris";
import { AdminShell, KpiTable } from "./admin-shell";
import type { SyncSummary } from "@notion-store-analyst/shared";

export function StatusView({
  summary,
  lastRun
}: {
  summary: SyncSummary | null;
  lastRun:
    | {
        completedAt: string | null;
        lastError: string | null;
        ordersCount: number;
        productsCount: number;
        customersCount: number;
        status: string;
      }
    | null;
}) {
  return (
    <AdminShell
      title="Status"
      subtitle="The admin view stays lightweight and status-oriented while the Notion workspace carries the operating context."
      summary={summary}
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Sync health
            </Text>
            <List>
              <List.Item>Last sync: {lastRun?.completedAt ?? "Not yet run"}</List.Item>
              <List.Item>Last error: {lastRun?.lastError ?? "None"}</List.Item>
              <List.Item>Orders processed: {lastRun?.ordersCount ?? 0}</List.Item>
              <List.Item>Products processed: {lastRun?.productsCount ?? 0}</List.Item>
              <List.Item>Customers processed: {lastRun?.customersCount ?? 0}</List.Item>
            </List>
            <Badge tone={lastRun?.status === "success" ? "success" : "attention"}>
              {lastRun?.status ?? "pending"}
            </Badge>
          </BlockStack>
        </Card>
        {summary ? <KpiTable summary={summary} /> : null}
      </BlockStack>
    </AdminShell>
  );
}
