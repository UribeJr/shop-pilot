import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import {
  NotionMcpOAuthProvider,
} from "../../../../lib/notion-mcp-provider";
import {
  listNotionMcpTools,
  callNotionMcpTool,
  UnauthorizedError,
} from "../../../../lib/notion-mcp-client";

const SESSION_COOKIE = "notion_mcp_session";

function getSessionId(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const sessionId = getSessionId(cookieStore);
  if (!sessionId) {
    return NextResponse.json(
      { error: "Not authenticated", needsAuth: true },
      { status: 401 }
    );
  }

  const provider = new NotionMcpOAuthProvider(sessionId);
  let body: { messages?: Array<{ role: string; content: string }>; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message ?? body.messages?.[body.messages.length - 1]?.content;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  let tools: Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }>;
  try {
    tools = await listNotionMcpTools(provider);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Notion session expired", needsAuth: true },
        { status: 401 }
      );
    }
    throw err;
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You are a helpful assistant with access to the user's Notion workspace via MCP tools.
Use the available tools to search, read, and create content in Notion when the user asks about their store data, reports, or workspace.
Shop Pilot syncs store analytics (revenue, orders, products, alerts) into Notion. Help the user find and reason over that data.
When you use tools, present the results clearly.`;

  const openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = tools.map(
    (t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description ?? "",
        parameters: t.inputSchema ?? { type: "object", properties: {} },
      },
    })
  );

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  const maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      max_tokens: 1024,
    });

    const choice = completion.choices[0];
    if (!choice?.message) {
      return NextResponse.json({
        error: "No response from model",
        reply: "",
      });
    }

    const msg = choice.message;

    if (!msg.tool_calls?.length) {
      return NextResponse.json({
        reply: msg.content ?? "",
      });
    }

    messages.push(msg);

    for (const tc of msg.tool_calls) {
      if (tc.type !== "function") continue;
      const name = tc.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments ?? "{}");
      } catch {}
      try {
        const result = await callNotionMcpTool(provider, name, args);
        const text = result.content
          ?.filter((c): c is { type: string; text?: string } => "text" in c)
          .map((c) => c.text ?? "")
          .join("\n");
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: text ?? JSON.stringify(result),
        } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Tool failed";
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: `Error: ${errMsg}`,
        } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam);
      }
    }

    iteration++;
  }

  return NextResponse.json({
    reply: "I wasn't able to complete your request. Please try again.",
  });
}
