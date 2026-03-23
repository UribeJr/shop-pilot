/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@notion-store-analyst/shared",
    "@notion-store-analyst/analytics",
    "@notion-store-analyst/notion-mcp",
    "@notion-store-analyst/shopify-client"
  ],
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.notion.so https://notion.so https://*.notion.so https://*.notion.site"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
