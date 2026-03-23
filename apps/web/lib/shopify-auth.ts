import { headers } from "next/headers";

export async function getEmbeddedShopContext() {
  const requestHeaders = await headers();
  return {
    shop: requestHeaders.get("x-shopify-shop-domain"),
    host: requestHeaders.get("x-shopify-host"),
    idToken: requestHeaders.get("authorization")
  };
}

export function buildAppBridgeInit() {
  return {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "",
    host: "",
    forceRedirect: true
  };
}
