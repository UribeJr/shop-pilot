import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getAppConfig } from "./config";

const SHOPIFY_AUTH_COOKIE = "shopify_oauth_state";
const SHOPIFY_SHOP_COOKIE = "shopify_shop";

type AccessTokenResponse = {
  access_token: string;
  scope: string;
};

export function normalizeShopDomain(shop: string | null | undefined) {
  if (!shop) return null;
  const normalized = shop.trim().toLowerCase();
  return /^[a-z0-9-]+\.myshopify\.com$/.test(normalized) ? normalized : null;
}

export function buildEmbeddedAdminUrl(shop: string) {
  return `https://${shop}/admin/apps/${process.env.SHOPIFY_APP_HANDLE ?? "notion-store-analyst"}`;
}

export async function createInstallRedirect(shop: string) {
  const config = getAppConfig();
  if (!config.NEXT_PUBLIC_SHOPIFY_API_KEY || !config.SHOPIFY_API_SECRET) {
    throw new Error("Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET for Shopify OAuth.");
  }

  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(SHOPIFY_AUTH_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  cookieStore.set(SHOPIFY_SHOP_COOKIE, shop, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });

  const installUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  installUrl.searchParams.set("client_id", config.NEXT_PUBLIC_SHOPIFY_API_KEY);
  installUrl.searchParams.set("scope", config.SHOPIFY_SCOPES);
  installUrl.searchParams.set(
    "redirect_uri",
    `${config.SHOPIFY_APP_URL.replace(/\/$/, "")}/api/shopify/callback`
  );
  installUrl.searchParams.set("state", state);
  return installUrl.toString();
}

export function verifyShopifyCallbackHmac(searchParams: URLSearchParams) {
  const config = getAppConfig();
  const hmac = searchParams.get("hmac");
  if (!config.SHOPIFY_API_SECRET || !hmac) return false;

  const sorted = [...searchParams.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = crypto.createHmac("sha256", config.SHOPIFY_API_SECRET).update(sorted).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function exchangeCodeForOfflineToken(shop: string, code: string) {
  const config = getAppConfig();
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.NEXT_PUBLIC_SHOPIFY_API_KEY,
      client_secret: config.SHOPIFY_API_SECRET,
      code
    })
  });

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed with ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as AccessTokenResponse;
}

export async function persistInstallation(input: {
  shopDomain: string;
  accessToken: string;
  scope: string;
}) {
  const store = await prisma.store.upsert({
    where: { shopDomain: input.shopDomain },
    update: {},
    create: {
      shopDomain: input.shopDomain,
      shopName: input.shopDomain,
      currencyCode: "USD"
    }
  });

  await prisma.shopifyInstallation.upsert({
    where: { shopDomain: input.shopDomain },
    update: {
      accessToken: input.accessToken,
      scopes: input.scope,
      installedAt: new Date(),
      uninstalledAt: null,
      appBridgeEnabled: true
    },
    create: {
      storeId: store.id,
      shopDomain: input.shopDomain,
      accessToken: input.accessToken,
      scopes: input.scope,
      appBridgeEnabled: true
    }
  });
}

export async function getPreferredInstallation() {
  const cookieStore = await cookies();
  const cookieShop = normalizeShopDomain(cookieStore.get(SHOPIFY_SHOP_COOKIE)?.value);
  if (cookieShop) {
    const installation = await prisma.shopifyInstallation.findFirst({
      where: { shopDomain: cookieShop, uninstalledAt: null }
    });
    if (installation?.accessToken) return installation;
  }

  return prisma.shopifyInstallation.findFirst({
    where: { uninstalledAt: null, accessToken: { not: null } },
    orderBy: { updatedAt: "desc" }
  });
}

export async function validateCallbackState(state: string | null) {
  const cookieStore = await cookies();
  const saved = cookieStore.get(SHOPIFY_AUTH_COOKIE)?.value;
  return Boolean(state && saved && state === saved);
}
