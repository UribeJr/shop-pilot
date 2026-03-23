"use client";

import { Badge, BlockStack, Button, Card, InlineStack, List, Text } from "@shopify/polaris";
import { AdminShell } from "./admin-shell";
import type { AdapterMode, SyncSummary } from "@notion-store-analyst/shared";
import { ShopifyInstallForm } from "./shopify-install-form";

export function SetupView({
  summary,
  shopifyMode,
  selectedMode,
  hasShopifyOauthConfig,
  hasNotionApiConfig,
  installedShop
}: {
  summary: SyncSummary | null;
  shopifyMode: "mock" | "real";
  selectedMode: AdapterMode;
  hasShopifyOauthConfig: boolean;
  hasNotionApiConfig: boolean;
  installedShop: string | null;
}) {
  return (
    <AdminShell
      title="Setup"
      subtitle="Connect Shopify and Notion MCP, then let Notion become the place where the merchant operates."
      summary={summary}
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Connection states
              </Text>
              <Badge tone={shopifyMode === "real" ? "success" : "attention"}>
                {`Shopify ${shopifyMode}`}
              </Badge>
            </InlineStack>
            <List>
              <List.Item>
                Shopify embedded app posture: App Bridge-ready shell, GraphQL Admin client, webhook route
                stubs, and install state persistence.
              </List.Item>
              <List.Item>
                Notion MCP posture: swappable adapter contract with real transport hooks and a mock adapter
                for local challenge demos.
              </List.Item>
              <List.Item>Selected Notion adapter mode: {selectedMode}</List.Item>
              <List.Item>Installed Shopify shop: {installedShop ?? "None yet"}</List.Item>
            </List>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Real Shopify install
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Connect any Shopify store (dev or production) via OAuth. Enter the store domain below and
              complete the install flow to use real store data for reports.
            </Text>
            {hasShopifyOauthConfig ? (
              <ShopifyInstallForm />
            ) : (
              <Text as="p" variant="bodyMd">
                Add `NEXT_PUBLIC_SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` to `.env` before starting a
                real install.
              </Text>
            )}
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Notion integration (MCP challenge)
              </Text>
              <Badge tone={hasNotionApiConfig ? "success" : "attention"}>
                {hasNotionApiConfig ? "Notion configured" : "Notion needs setup"}
              </Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              The app writes store analytics to your Notion workspace. Connect Notion MCP in your AI
              tool (Cursor, ChatGPT, Claude) to search and reason over this data — that's the
              superpowers workflow.
            </Text>
            {hasNotionApiConfig ? (
              <Text as="p" variant="bodyMd">
                Notion API credentials detected. Use &quot;Use real Notion adapter&quot; below, then
                run sync to write reports to your workspace.
              </Text>
            ) : (
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Setup steps:
                </Text>
                <List>
                  <List.Item>Create an integration at notion.so/my-integrations</List.Item>
                  <List.Item>Create a page in Notion (e.g. &quot;Shop Pilot&quot;) and share it with your integration</List.Item>
                  <List.Item>Copy the page ID from the URL (the 32-char hex after the last dash)</List.Item>
                  <List.Item>
                    Add to .env: NOTION_API_KEY=&quot;secret_xxx&quot; NOTION_PARENT_PAGE_ID=&quot;xxx&quot;
                  </List.Item>
                  <List.Item>Restart the app and select &quot;Use real Notion adapter&quot;</List.Item>
                </List>
              </BlockStack>
            )}
            <InlineStack gap="300">
              <Button url="/api/setup/notion-mode?mode=mock">Use mock Notion adapter</Button>
              <Button
                url="/api/setup/notion-mode?mode=real"
                variant="primary"
                disabled={!hasNotionApiConfig}
              >
                Use real Notion adapter
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </AdminShell>
  );
}
