import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/types/database";

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  drinking_water: "Drinking Water",
  roads: "Roads & Transport",
  pension: "Pension & Welfare",
  healthcare: "Healthcare",
  education: "Education",
  infrastructure: "Infrastructure",
  other: "Other",
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_ORDER: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthlyTimeline(complaints: Complaint[], months = 6) {
  const now = new Date();
  const buckets: { month: string; count: number; sortKey: string }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      sortKey: monthKey(d),
      month: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
      count: 0,
    });
  }

  for (const complaint of complaints) {
    const d = new Date(complaint.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = monthKey(d);
    const bucket = buckets.find((b) => b.sortKey === key);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ month, count }) => ({ month, count }));
}

export function buildComplaintDashboardStats(complaints: Complaint[]) {
  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "submitted" || c.status === "under_review"
  ).length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const categoryCounts: Record<string, number> = {};
  for (const complaint of complaints) {
    categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
  }

  const categoryData = Object.entries(categoryCounts)
    .map(([category, count]) => {
      const key = category as ComplaintCategory;
      return {
        category: key,
        label: COMPLAINT_CATEGORY_LABELS[key] ?? category.replace(/_/g, " "),
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  const statusData = STATUS_ORDER.map((status) => ({
    status,
    label: COMPLAINT_STATUS_LABELS[status],
    count: complaints.filter((c) => c.status === status).length,
  })).filter((row) => row.count > 0);

  return {
    total,
    pending,
    inProgress,
    resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    monthlyData: buildMonthlyTimeline(complaints),
    categoryData,
    statusData,
  };
}

export type ComplaintDashboardStats = ReturnType<typeof buildComplaintDashboardStats>;
