"use client";

import Link from "next/link";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  DataTable,
  Divider,
  InlineStack,
  Layout,
  List,
  Page,
  Text
} from "@shopify/polaris";
import { GenerateReportButton } from "./generate-report-button";
import type { SyncSummary } from "@notion-store-analyst/shared";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Setup", href: "/setup" },
  { label: "Status", href: "/status" },
  { label: "Reports", href: "/reports" },
  { label: "Demo", href: "/demo" }
];

export function AdminShell({
  title,
  subtitle,
  children,
  summary
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  summary?: SyncSummary | null;
}) {
  return (
    <div className="appShell">
      <div className="posterRail">
        <section className="heroNote">
          <p>Notion as the operating layer</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        {summary ? (
          <div className="metricStrip">
            <div className="metricPill">
              Adapter
              <strong>{summary.adapterMode}</strong>
            </div>
            <div className="metricPill">
              Store
              <strong>{summary.storeDomain}</strong>
            </div>
            <div className="metricPill">
              KPIs written
              <strong>{summary.kpiRecords.length}</strong>
            </div>
            <div className="metricPill">
              Alerts created
              <strong>{summary.alertRecords.length}</strong>
            </div>
          </div>
        ) : null}
        <Page
          title={title}
          subtitle={subtitle}
        >
          <Layout>
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Admin surface
                  </Text>
                  <BlockStack gap="200">
                    {navItems.map((item) => (
                      <InlineStack key={item.href} align="space-between">
                        <Link href={item.href}>{item.label}</Link>
                        <Badge tone="info">Embedded</Badge>
                      </InlineStack>
                    ))}
                  </BlockStack>
                  <Divider />
                  <GenerateReportButton />
                  <Text as="p" variant="bodyMd" tone="subdued">
                    The admin app stays minimal. The merchant-facing value lives in the Notion MCP
                    workspace, not in a bulky dashboard.
                  </Text>
                </BlockStack>
              </Card>
              {summary ? (
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd">
                        Current Notion context
                      </Text>
                      <List>
                        <List.Item>{summary.merchantContext.preferences.businessFocus}</List.Item>
                        <List.Item>{summary.merchantContext.preferences.summaryNotes}</List.Item>
                      </List>
                    </BlockStack>
                  </Card>
                </Box>
              ) : null}
            </Layout.Section>
            <Layout.Section>{children}</Layout.Section>
          </Layout>
        </Page>
      </div>
    </div>
  );
}

export function KpiTable({ summary }: { summary: SyncSummary }) {
  return (
    <Card>
      <DataTable
        columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric"]}
        headings={["Window", "Revenue", "Orders", "AOV", "Repeat customer rate %"]}
        rows={summary.report.kpiSnapshot.map((kpi) => [
          kpi.window,
          `$${kpi.revenue.toFixed(2)}`,
          String(kpi.orders),
          `$${kpi.averageOrderValue.toFixed(2)}`,
          (kpi.repeatCustomerRate * 100).toFixed(1)
        ])}
      />
    </Card>
  );
}
