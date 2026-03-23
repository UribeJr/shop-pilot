import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NotionMcpOAuthProvider } from "../../../../../lib/notion-mcp-provider";

const NOTION_MCP_URL = "https://mcp.notion.com/mcp";
const SESSION_COOKIE = "notion_mcp_session";

export async function GET() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = `mcp_${crypto.randomUUID().replace(/-/g, "")}`;
    cookieStore.set(SESSION_COOKIE, sessionId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const provider = new NotionMcpOAuthProvider(sessionId);
  const result = await auth(provider, {
    serverUrl: NOTION_MCP_URL,
  });

  if (result === "AUTHORIZED") {
    return NextResponse.redirect(new URL("/embed/chat", getBaseUrl()));
  }

  const authUrl = provider.authUrlToRedirect;
  if (!authUrl) {
    return NextResponse.json(
      { error: "Failed to get authorization URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(authUrl.toString());
}

function getBaseUrl(): string {
  return process.env.SHOPIFY_APP_URL ?? "http://localhost:3000";
}
