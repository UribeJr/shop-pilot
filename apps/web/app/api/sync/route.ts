import { NextResponse } from "next/server";
import { runSync } from "../../../lib/sync";

export async function GET() {
  try {
    const summary = await runSync();
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    console.error("[sync] Error:", message);
    const isAuth = message.includes("401") || message.includes("Unauthorized") || message.includes("invalid") && message.includes("token");
    return NextResponse.json(
      {
        ok: false,
        error: message,
        ...(isAuth
          ? { reinstallHint: "Go to /setup, uninstall the app from your store first, then re-install to get a fresh token." }
          : {})
      },
      { status: 500 }
    );
  }
}
