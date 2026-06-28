"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Download, Search, Eye, Paperclip } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminLoading,
  AdminEmpty,
  statusBadgeVariant,
} from "@/components/admin/ui";
import type { Complaint, ComplaintStatus } from "@/types/database";

const statuses: ComplaintStatus[] = ["submitted", "under_review", "in_progress", "resolved"];

export function ComplaintsTable() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<ComplaintStatus>("submitted");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComplaints(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = (complaint: Complaint) => {
    setSelected(complaint);
    setRemarks(complaint.remarks ?? "");
    setStatus(complaint.status);
  };

  const updateComplaint = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/complaints/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remarks }),
    });
    if (res.ok) {
      setSelected(null);
      load();
    }
    setSaving(false);
  };

  const quickUpdateStatus = async (id: string, newStatus: ComplaintStatus) => {
    await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: "complaint_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-[var(--admin-navy)]">
          {row.original.complaint_id}
        </span>
      ),
    },
    { accessorKey: "citizen_name", header: "Citizen" },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <AdminBadge variant="muted">{row.original.category.replace(/_/g, " ")}</AdminBadge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <select
          value={row.original.status}
          onChange={(e) => quickUpdateStatus(row.original.id, e.target.value as ComplaintStatus)}
          className="text-xs border border-[var(--admin-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--admin-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-saffron)]/30"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[var(--admin-muted)]">
          {new Date(row.original.created_at).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => openDetail(row.original)}
          className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] hover:text-[var(--admin-navy)] transition-colors"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
  });

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader
        title="Citizen Grievances"
        description="Review, track, and resolve complaints submitted by the public."
        action={
          <div className="flex gap-2">
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4" /> CSV
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              <Download className="h-4 w-4" /> Excel
            </AdminButton>
          </div>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--admin-muted)]" />
        <input
          type="search"
          placeholder="Search by name, ID, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input admin-input-has-icon"
        />
      </div>

      {complaints.length === 0 ? (
        <AdminEmpty message="No complaints submitted yet." />
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm admin-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-5 py-3 text-left whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogRoot open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent
            title={selected.complaint_id}
            description="Citizen grievance details and resolution workflow"
            className="max-w-2xl"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--admin-navy-soft)]">
                {[
                  ["Citizen", selected.citizen_name],
                  ["Phone", selected.phone],
                  ["Ward", selected.ward],
                  ["Panchayat", selected.panchayat],
                  ["Category", selected.category.replace(/_/g, " ")],
                  ["Submitted", new Date(selected.created_at).toLocaleString("en-IN")],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-[var(--admin-navy)] mt-0.5 capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--admin-navy)] mb-2">Description</p>
                <p className="text-sm text-[var(--admin-muted)] p-4 rounded-xl border border-[var(--admin-border)] bg-white leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {selected.attachments?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[var(--admin-navy)] mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Attachments
                  </p>
                  <ul className="space-y-2">
                    {selected.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--admin-saffron)] hover:underline"
                        >
                          {a.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--admin-navy)] mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  className="admin-input"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-navy)] mb-2">
                  Admin Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="admin-textarea"
                  placeholder="Internal notes or resolution details..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <AdminButton variant="outline" onClick={() => setSelected(null)}>
                  Close
                </AdminButton>
                <AdminButton onClick={updateComplaint} disabled={saving}>
                  {saving ? "Saving..." : "Update Complaint"}
                </AdminButton>
              </div>
            </div>
          </DialogContent>
        )}
      </DialogRoot>
    </div>
  );

  function handleExport(format: string) {
    window.open(`/api/export/complaints?format=${format}`, "_blank");
  }
}
