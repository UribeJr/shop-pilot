import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode");
  const response = NextResponse.redirect(new URL("/setup", request.url));

  if (mode === "mock" || mode === "real") {
    response.cookies.set("notion-mcp-mode", mode, { httpOnly: false, sameSite: "lax" });
  }

  return response;
}
