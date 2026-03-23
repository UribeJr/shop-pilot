import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import type { NotionMcpOAuthProvider } from "./notion-mcp-provider";

const NOTION_MCP_URL = "https://mcp.notion.com/mcp";

export type McpTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export type McpToolResult = {
  content: Array<{ type: string; text?: string; [k: string]: unknown }>;
  isError?: boolean;
};

/**
 * Create and connect an MCP client to Notion MCP with the given OAuth provider.
 * @returns Connected client and transport, or throws UnauthorizedError if auth needed
 */
export async function createNotionMcpClient(provider: NotionMcpOAuthProvider) {
  const client = new Client(
    { name: "shop-pilot", version: "1.0.0" },
    { capabilities: {} }
  );

  const baseUrl = new URL(NOTION_MCP_URL);
  const transport = new StreamableHTTPClientTransport(baseUrl, {
    authProvider: provider,
  });

  await client.connect(transport);

  return { client, transport };
}

/**
 * List available MCP tools.
 */
export async function listNotionMcpTools(
  provider: NotionMcpOAuthProvider
): Promise<McpTool[]> {
  const { client, transport } = await createNotionMcpClient(provider);
  try {
    const result = await client.request(
      { method: "tools/list", params: {} },
      ListToolsResultSchema
    );
    transport.close();
    return (result.tools ?? []).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  } catch (err) {
    await transport.close();
    throw err;
  }
}

/**
 * Call an MCP tool.
 */
export async function callNotionMcpTool(
  provider: NotionMcpOAuthProvider,
  name: string,
  args: Record<string, unknown>
): Promise<McpToolResult> {
  const { client, transport } = await createNotionMcpClient(provider);
  try {
    const result = await client.callTool(
      { name, arguments: args },
      CallToolResultSchema
    );
    await transport.close();
    return result as McpToolResult;
  } catch (err) {
    await transport.close();
    throw err;
  }
}

export { UnauthorizedError };
