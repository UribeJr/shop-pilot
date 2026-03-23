import { NextRequest, NextResponse } from "next/server";
import { getAppConfig } from "../../../../lib/config";
import { createInstallRedirect, normalizeShopDomain } from "../../../../lib/shopify-oauth";

export async function GET(request: NextRequest) {
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  if (!shop) {
    return NextResponse.json(
      { ok: false, error: "Expected ?shop=your-store.myshopify.com" },
      { status: 400 }
    );
  }

  const config = getAppConfig();
  const appUrl = config.SHOPIFY_APP_URL?.replace(/\/$/, "") ?? "";
  if (process.env.NODE_ENV === "production" && (!appUrl.startsWith("https://") || appUrl.includes("localhost"))) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid SHOPIFY_APP_URL for production. Set SHOPIFY_APP_URL in Render env vars to your app URL (e.g. https://shop-pilot-u2qa.onrender.com). It must match the redirect URL in Shopify Partner Dashboard.",
        hint: "Render Dashboard → Your service → Environment → Add SHOPIFY_APP_URL"
      },
      { status: 500 }
    );
  }

  try {
    const redirectUrl = await createInstallRedirect(shop);
    if (request.nextUrl.searchParams.get("debug") === "1") {
      const parsed = new URL(redirectUrl);
      return NextResponse.json({
        redirect_uri: parsed.searchParams.get("redirect_uri"),
        oauth_url: redirectUrl,
        hint: "redirect_uri must match exactly in Shopify Partners → App setup → Allowed redirection URLs"
      });
    }
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Install bootstrap failed" },
      { status: 500 }
    );
  }
}
