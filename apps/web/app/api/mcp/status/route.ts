import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NotionMcpOAuthProvider } from "../../../../lib/notion-mcp-provider";

const SESSION_COOKIE = "notion_mcp_session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ connected: false });
  }

  const provider = new NotionMcpOAuthProvider(sessionId);
  const tokens = await provider.tokens();
  return NextResponse.json({ connected: !!tokens });
}
