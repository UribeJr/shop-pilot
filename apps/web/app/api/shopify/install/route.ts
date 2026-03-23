import { NextRequest, NextResponse } from "next/server";
import { createInstallRedirect, normalizeShopDomain } from "../../../../lib/shopify-oauth";

export async function GET(request: NextRequest) {
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  if (!shop) {
    return NextResponse.json(
      { ok: false, error: "Expected ?shop=your-dev-store.myshopify.com" },
      { status: 400 }
    );
  }

  try {
    const redirectUrl = await createInstallRedirect(shop);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Install bootstrap failed" },
      { status: 500 }
    );
  }
}
