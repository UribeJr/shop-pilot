import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const shop = request.headers.get("x-shopify-shop-domain") ?? "unknown";
  const signature = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhook(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  if (topic === "app/uninstalled") {
    await prisma.shopifyInstallation.updateMany({
      where: { shopDomain: shop },
      data: { uninstalledAt: new Date() }
    });
  }

  // TODO: register additional webhook topics such as orders/create and products/update in production.
  return NextResponse.json({ ok: true, topic, shop });
}
