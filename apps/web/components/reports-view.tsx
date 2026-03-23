"use client";

import { Button, Card, DataTable, Text } from "@shopify/polaris";
import { AdminShell } from "./admin-shell";
import type { SyncSummary } from "@notion-store-analyst/shared";

export function ReportsView({
  summary,
  reports
}: {
  summary: SyncSummary | null;
  reports: Array<{ slug: string; generatedAt: string; executiveSummary: string }>;
}) {
  return (
    <AdminShell
      title="Reports"
      subtitle="Stored reports show the local audit trail while the live narrative and structured data are synchronized into Notion."
      summary={summary}
    >
      <Card>
        <Text as="h2" variant="headingMd">
          Local report history
        </Text>
        <div style={{ height: 12 }} />
        <DataTable
          columnContentTypes={["text", "text", "text"]}
          headings={["Slug", "Generated", "Summary"]}
          rows={reports.map((report) => [report.slug, report.generatedAt, report.executiveSummary])}
        />
        <div style={{ height: 16 }} />
        <Button url="/api/sync" variant="primary">
          Generate report now
        </Button>
      </Card>
    </AdminShell>
  );
}
