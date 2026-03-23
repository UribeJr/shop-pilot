"use client";

import { BlockStack, Card, Text } from "@shopify/polaris";
import { AdminShell, KpiTable } from "./admin-shell";
import type { SyncSummary } from "@notion-store-analyst/shared";

export function DemoView({ summary }: { summary: SyncSummary | null }) {
  return (
    <AdminShell
      title="Demo Payloads"
      subtitle="This screen exposes the exact Notion-facing payloads so the challenge demo can prove that Notion is the primary operating surface."
      summary={summary}
    >
      <BlockStack gap="400">
        {summary ? <KpiTable summary={summary} /> : null}
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Dashboard payload
            </Text>
            <pre className="jsonBox">{JSON.stringify(summary?.payloadPreview.dashboard ?? {}, null, 2)}</pre>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Weekly report payload
            </Text>
            <pre className="jsonBox">
              {JSON.stringify(summary?.payloadPreview.weeklyReport ?? {}, null, 2)}
            </pre>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Database payloads
            </Text>
            <pre className="jsonBox">
              {JSON.stringify(
                {
                  kpiHistory: summary?.payloadPreview.kpiHistory ?? [],
                  productsToWatch: summary?.payloadPreview.productsToWatch ?? [],
                  alerts: summary?.payloadPreview.alerts ?? []
                },
                null,
                2
              )}
            </pre>
          </BlockStack>
        </Card>
      </BlockStack>
    </AdminShell>
  );
}
