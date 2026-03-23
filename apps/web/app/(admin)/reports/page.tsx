import { ReportsView } from "../../../components/reports-view";
import { prisma } from "../../../lib/prisma";
import { getLatestSummary } from "../../../lib/sync";

export default async function ReportsPage() {
  const summary = await getLatestSummary();
  const reports = await prisma.weeklyReport.findMany({ orderBy: { generatedAt: "desc" }, take: 10 });

  return (
    <ReportsView
      summary={summary}
      reports={reports.map((report) => ({
        slug: report.slug,
        generatedAt: report.generatedAt.toISOString(),
        executiveSummary: report.executiveSummary
      }))}
    />
  );
}
