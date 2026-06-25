"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MessageSquare, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { AdminPageHeader, AdminStatCard, AdminCard } from "@/components/admin/ui";

const CHART_COLORS = ["#e8850c", "#0c1e42", "#046a38", "#1a2f5c", "#cf7408", "#64748b"];

export function DashboardCharts({
  stats,
}: {
  stats: Awaited<ReturnType<typeof import("@/lib/data/queries").getComplaintStats>>;
}) {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of citizen grievances and constituency portal activity."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard label="Total Complaints" value={stats.total} icon={MessageSquare} accent="navy" />
        <AdminStatCard label="Pending Review" value={stats.pending} icon={AlertCircle} accent="amber" />
        <AdminStatCard label="In Progress" value={stats.inProgress} icon={Clock} accent="saffron" />
        <AdminStatCard label="Resolved" value={stats.resolved} icon={CheckCircle} accent="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard>
          <h3 className="text-sm font-semibold text-[var(--admin-navy)] mb-1">Monthly Complaints</h3>
          <p className="text-xs text-[var(--admin-muted)] mb-6">Submission volume over time</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="count" fill="#e8850c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-[var(--admin-navy)] mb-1">Category Distribution</h3>
          <p className="text-xs text-[var(--admin-muted)] mb-6">Complaints by issue type</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                label={(props) => {
                  const entry = props as { category?: string; percent?: number };
                  return `${((entry.percent ?? 0) * 100).toFixed(0)}%`;
                }}
              >
                {stats.categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[var(--admin-green-soft)]">
              <TrendingUp className="h-5 w-5 text-[var(--admin-green)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--admin-muted)]">Resolution Rate</p>
              <p className="text-4xl font-semibold text-[var(--admin-green)] mt-1 tabular-nums">
                {stats.resolutionRate}%
              </p>
              <p className="text-xs text-[var(--admin-muted)] mt-1">
                Of all submitted grievances resolved
              </p>
            </div>
          </div>
          <div className="sm:w-64 w-full">
            <div className="h-3 bg-[var(--admin-navy-soft)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${stats.resolutionRate}%`,
                  background: "linear-gradient(90deg, #046a38, #0a8c4a)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--admin-muted)] mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
