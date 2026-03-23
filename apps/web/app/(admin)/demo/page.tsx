import { DemoView } from "../../../components/demo-view";
import { getLatestSummary } from "../../../lib/sync";

export default async function DemoPage() {
  const summary = await getLatestSummary();

  return <DemoView summary={summary} />;
}
