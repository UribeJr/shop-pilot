import { cookies } from "next/headers";
import { SetupView } from "../../../components/setup-view";
import { getAppConfig } from "../../../lib/config";
import { prisma } from "../../../lib/prisma";
import { getLatestSummary } from "../../../lib/sync";

export default async function SetupPage() {
  const config = getAppConfig();
  const summary = await getLatestSummary();
  const latestInstallation = await prisma.shopifyInstallation.findFirst({
    where: { uninstalledAt: null },
    orderBy: { updatedAt: "desc" }
  });
  const cookieStore = await cookies();
  const selectedMode = cookieStore.get("notion-mcp-mode")?.value ?? config.NOTION_MCP_MODE;

  return (
    <SetupView
      summary={summary}
      shopifyMode={latestInstallation?.accessToken ? "real" : config.shopifyMode}
      selectedMode={selectedMode as "mock" | "real"}
      hasShopifyOauthConfig={config.hasShopifyOauthConfig}
      hasNotionApiConfig={config.hasNotionApiConfig}
      installedShop={latestInstallation?.shopDomain ?? null}
    />
  );
}
