import { PrismaClient } from "@prisma/client";
import { buildWeeklyReport } from "@notion-store-analyst/analytics";
import { NotionMcpClient } from "@notion-store-analyst/notion-mcp";
import { getDemoShopifySnapshot } from "@notion-store-analyst/shopify-client";
import type { MerchantContext } from "@notion-store-analyst/shared";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function persistRun(label: string, merchantContext: MerchantContext) {
  const snapshot = getDemoShopifySnapshot();
  const notion = new NotionMcpClient({ mode: "mock" });
  const report = buildWeeklyReport(snapshot, merchantContext);
  const sync = await notion.syncWorkspace({
    storeDomain: snapshot.shop.domain,
    merchantContext,
    report
  });

  const outDir = path.join(process.cwd(), "data", "demo");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, `${label}-sync-summary.json`),
    JSON.stringify(
      {
        merchantContext,
        report,
        payloadPreview: sync.payloadPreview
      },
      null,
      2
    )
  );

  const store = await prisma.store.upsert({
    where: { shopDomain: snapshot.shop.domain },
    update: {
      shopName: snapshot.shop.name,
      currencyCode: snapshot.shop.currencyCode,
      planDisplayName: snapshot.shop.planDisplayName
    },
    create: {
      shopDomain: snapshot.shop.domain,
      shopName: snapshot.shop.name,
      currencyCode: snapshot.shop.currencyCode,
      planDisplayName: snapshot.shop.planDisplayName
    }
  });

  await prisma.weeklyReport.upsert({
    where: { slug: `${report.slug}-${label}` },
    update: {
      generatedAt: new Date(report.generatedAt),
      executiveSummary: report.executiveSummary,
      recommendedActions: JSON.stringify(report.recommendedActions),
      rawJson: JSON.stringify(report, null, 2)
    },
    create: {
      storeId: store.id,
      slug: `${report.slug}-${label}`,
      generatedAt: new Date(report.generatedAt),
      executiveSummary: report.executiveSummary,
      recommendedActions: JSON.stringify(report.recommendedActions),
      rawJson: JSON.stringify(report, null, 2)
    }
  });
}

async function main() {
  const notion = new NotionMcpClient({ mode: "mock" });
  const baseContext = await notion.getMerchantContext();

  await persistRun("default", baseContext);
  await persistRun("repeat-purchase-focused", {
    ...baseContext,
    preferences: {
      ...baseContext.preferences,
      businessFocus: "Focus on repeat purchases only",
      summaryNotes: "Push retention recommendations first and ignore minor catalog noise."
    },
    reporting: {
      ...baseContext.reporting,
      majorDropOnly: true
    }
  });

  console.log("Demo sync outputs written to data/demo.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
