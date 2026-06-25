import { getComplaintStats } from "@/lib/data/queries";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage() {
  const stats = await getComplaintStats();
  return <DashboardCharts stats={stats} />;
}
