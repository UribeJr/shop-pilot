import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NotionMcpOAuthProvider } from "../../../../../lib/notion-mcp-provider";
import { prisma } from "../../../../../lib/prisma";

const NOTION_MCP_URL = "https://mcp.notion.com/mcp";
const SESSION_COOKIE = "notion_mcp_session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return redirectWithError(`OAuth error: ${error}`);
  }

  if (!code || !state) {
    return redirectWithError("Missing code or state");
  }

  const pending = await NotionMcpOAuthProvider.getPendingByState(state);
  if (!pending?.codeVerifier) {
    return redirectWithError("Invalid or expired state");
  }

  const provider = NotionMcpOAuthProvider.createForCallback(
    pending.sessionId,
    pending.codeVerifier
  );

  try {
    const result = await auth(provider, {
      serverUrl: NOTION_MCP_URL,
      authorizationCode: code,
    });

    if (result !== "AUTHORIZED") {
      return redirectWithError("Authorization failed");
    }

    await prisma.notionMcpPendingAuth.delete({ where: { state } }).catch(() => {});

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, pending.sessionId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.redirect(new URL("/embed/chat", getBaseUrl()));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return redirectWithError(`Token exchange failed: ${message}`);
  }
}

function getBaseUrl(): string {
  return process.env.SHOPIFY_APP_URL ?? "http://localhost:3000";
}

function redirectWithError(message: string) {
  const url = new URL("/embed/chat", getBaseUrl());
  url.searchParams.set("error", message);
  return NextResponse.redirect(url.toString());
}
