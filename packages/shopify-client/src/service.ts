import type { ShopifyStoreSnapshot } from "@notion-store-analyst/shared";
import { getDemoShopifySnapshot } from "./demoData";
import { fetchShopifySnapshot, ShopifyAdminClient } from "./client";

export type ShopifyDataSourceOptions = {
  mode: "mock" | "real";
  shopDomain?: string;
  accessToken?: string;
};

export async function getShopifyDataSource(
  options: ShopifyDataSourceOptions
): Promise<ShopifyStoreSnapshot> {
  if (options.mode === "mock") {
    return getDemoShopifySnapshot();
  }

  const client = new ShopifyAdminClient({
    shopDomain: options.shopDomain,
    accessToken: options.accessToken
  });
  return fetchShopifySnapshot(client);
}
