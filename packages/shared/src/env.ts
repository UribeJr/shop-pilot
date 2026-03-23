import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  NEXT_PUBLIC_SHOPIFY_API_KEY: z.string().optional(),
  SHOPIFY_API_SECRET: z.string().optional(),
  SHOPIFY_APP_URL: z.string().default("http://localhost:3000"),
  SHOPIFY_APP_HANDLE: z.string().default("notion-store-analyst"),
  SHOPIFY_SCOPES: z
    .string()
    .default("read_orders,read_products,read_customers,read_inventory"),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
  SHOPIFY_SHOP_DOMAIN: z.string().optional(),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
  NOTION_MCP_MODE: z.enum(["mock", "real"]).default("mock"),
  NOTION_MCP_BASE_URL: z.string().optional(),
  NOTION_MCP_API_KEY: z.string().optional(),
  /** Notion Internal Integration secret + parent page ID for direct API writes */
  NOTION_API_KEY: z.string().optional(),
  NOTION_PARENT_PAGE_ID: z.string().optional()
});

export function getEnv(input: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(input);
}
