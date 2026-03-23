import { getEnv } from "@notion-store-analyst/shared";

export function getAppConfig() {
  const env = getEnv();
  return {
    ...env,
    hasShopifyOauthConfig: Boolean(env.NEXT_PUBLIC_SHOPIFY_API_KEY && env.SHOPIFY_API_SECRET),
    shopifyMode: env.SHOPIFY_ADMIN_ACCESS_TOKEN && env.SHOPIFY_SHOP_DOMAIN ? "real" : "mock",
    hasNotionApiConfig: Boolean(env.NOTION_API_KEY && env.NOTION_PARENT_PAGE_ID)
  } as const;
}
