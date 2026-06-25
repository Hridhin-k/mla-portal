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
  LabelList,
} from "recharts";
import { MessageSquare, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { AdminPageHeader, AdminStatCard, AdminCard } from "@/components/admin/ui";
import type { ComplaintDashboardStats } from "@/lib/admin/dashboard-stats";

const CHART_COLORS = ["#e8850c", "#0c1e42", "#046a38", "#1a2f5c", "#cf7408", "#64748b", "#0a8c4a"];
const STATUS_COLORS: Record<string, string> = {
  submitted: "#64748b",
  under_review: "#e8850c",
  in_progress: "#1a2f5c",
  resolved: "#046a38",
};

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[280px] text-sm text-[var(--admin-muted)] text-center px-6">
      {message}
    </div>
  );
}

function MonthlyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-[var(--admin-navy)]">{label}</p>
      <p className="text-[var(--admin-muted)] mt-0.5">
        <span className="font-semibold text-[var(--admin-saffron)]">{count}</span>
        {" "}complaint{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: { label?: string; count?: number; percent?: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 shadow-md text-sm max-w-[220px]">
      <p className="font-medium text-[var(--admin-navy)]">{item.label}</p>
      <p className="text-[var(--admin-muted)] mt-0.5">
        <span className="font-semibold text-[var(--admin-navy)]">{item.count}</span> complaints
        {" "}({item.percent}%)
      </p>
    </div>
  );
}


export function DashboardCharts({ stats }: { stats: ComplaintDashboardStats }) {
  const monthlyMax = Math.max(...stats.monthlyData.map((d) => d.count), 1);
  const yAxisMax = Math.max(monthlyMax + 1, 4);

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
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-navy)]">Monthly Complaints</h3>
              <p className="text-xs text-[var(--admin-muted)] mt-1">Last 6 months of submissions</p>
            </div>
            <span className="text-xs font-medium text-[var(--admin-muted)] bg-[var(--admin-navy-soft)] px-2.5 py-1 rounded-full tabular-nums">
              Total: {stats.monthlyData.reduce((sum, row) => sum + row.count, 0)}
            </span>
          </div>
          {stats.total === 0 ? (
            <ChartEmpty message="No complaints submitted yet. Data will appear here as citizens file grievances." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, yAxisMax]}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<MonthlyTooltip />} cursor={{ fill: "rgba(232, 133, 12, 0.08)" }} />
                <Bar dataKey="count" fill="#e8850c" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  <LabelList
                    dataKey="count"
                    position="top"
                    className="fill-[var(--admin-navy)]"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminCard>

        <AdminCard>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-navy)]">By Category</h3>
              <p className="text-xs text-[var(--admin-muted)] mt-1">Share of complaints by issue type</p>
            </div>
            {stats.total > 0 && (
              <span className="text-xs font-medium text-[var(--admin-muted)] bg-[var(--admin-navy-soft)] px-2.5 py-1 rounded-full tabular-nums">
                {stats.categoryData.length} categories
              </span>
            )}
          </div>
          {stats.categoryData.length === 0 ? (
            <ChartEmpty message="No category data yet. Categories appear once complaints are submitted." />
          ) : (
            <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-center">
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={stats.categoryData.length > 1 ? 2 : 0}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {stats.categoryData.map((entry, i) => (
                        <Cell key={entry.category} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-[var(--admin-navy)] tabular-nums">{stats.total}</span>
                  <span className="text-[11px] text-[var(--admin-muted)] uppercase tracking-wide">total</span>
                </div>
              </div>
              <ul className="space-y-2">
                {stats.categoryData.map((item, index) => (
                  <li key={item.category} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-[var(--admin-navy)] truncate">{item.label}</span>
                    </div>
                    <span className="text-[var(--admin-muted)] tabular-nums shrink-0">
                      {item.count} ({item.percent}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AdminCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard>
          <h3 className="text-sm font-semibold text-[var(--admin-navy)]">Status Breakdown</h3>
          <p className="text-xs text-[var(--admin-muted)] mt-1 mb-6">Where complaints stand in the workflow</p>
          {stats.statusData.length === 0 ? (
            <ChartEmpty message="No status data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.statusData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={96}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? 0} complaints`, "Count"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {stats.statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                  <LabelList dataKey="count" position="right" fontSize={12} fill="#0c1e42" fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminCard>

        <AdminCard>
          <div className="flex flex-col h-full justify-between gap-6">
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
                  {stats.resolved} of {stats.total} grievances resolved
                </p>
              </div>
            </div>

            <div>
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

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--admin-border)]">
              <div className="rounded-lg bg-[var(--admin-navy-soft)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-[var(--admin-muted)]">Open</p>
                <p className="text-lg font-semibold text-[var(--admin-navy)] tabular-nums mt-0.5">
                  {stats.pending + stats.inProgress}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--admin-green-soft)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-[var(--admin-muted)]">Closed</p>
                <p className="text-lg font-semibold text-[var(--admin-green)] tabular-nums mt-0.5">
                  {stats.resolved}
                </p>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
