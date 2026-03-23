import { NextRequest, NextResponse } from "next/server";
import {
  buildEmbeddedAdminUrl,
  exchangeCodeForOfflineToken,
  normalizeShopDomain,
  persistInstallation,
  validateCallbackState,
  verifyShopifyCallbackHmac
} from "../../../../lib/shopify-oauth";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const shop = normalizeShopDomain(params.get("shop"));
  const code = params.get("code");
  const state = params.get("state");

  if (!shop || !code) {
    return NextResponse.json({ ok: false, error: "Missing shop or code" }, { status: 400 });
  }

  if (!(await validateCallbackState(state))) {
    return NextResponse.json({ ok: false, error: "Invalid OAuth state" }, { status: 400 });
  }

  if (!verifyShopifyCallbackHmac(params)) {
    return NextResponse.json({ ok: false, error: "Invalid Shopify callback HMAC" }, { status: 401 });
  }

  try {
    const token = await exchangeCodeForOfflineToken(shop, code);
    await persistInstallation({
      shopDomain: shop,
      accessToken: token.access_token,
      scope: token.scope
    });

    return NextResponse.redirect(buildEmbeddedAdminUrl(shop));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "OAuth callback failed" },
      { status: 500 }
    );
  }
}
