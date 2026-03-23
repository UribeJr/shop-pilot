import { StatusView } from "../../../components/status-view";
import { prisma } from "../../../lib/prisma";
import { getLatestSummary } from "../../../lib/sync";

export default async function StatusPage() {
  const summary = await getLatestSummary();
  const lastRun = await prisma.syncRun.findFirst({ orderBy: { completedAt: "desc" } });

  return (
    <StatusView
      summary={summary}
      lastRun={
        lastRun
          ? {
              completedAt: lastRun.completedAt?.toISOString() ?? null,
              lastError: lastRun.lastError,
              ordersCount: lastRun.ordersCount,
              productsCount: lastRun.productsCount,
              customersCount: lastRun.customersCount,
              status: lastRun.status
            }
          : null
      }
    />
  );
}
