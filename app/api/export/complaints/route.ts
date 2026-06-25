import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireStaff } from "@/lib/admin/auth";
import { getAllComplaints } from "@/lib/data/queries";

export async function GET(request: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "csv";

  const complaints = await getAllComplaints();
  const rows = complaints.map((c) => ({
    "Complaint ID": c.complaint_id,
    Name: c.citizen_name,
    Phone: c.phone,
    Ward: c.ward,
    Panchayat: c.panchayat,
    Category: c.category,
    Status: c.status,
    Description: c.description,
    "Created At": c.created_at,
    Remarks: c.remarks ?? "",
  }));

  if (format === "xlsx" || format === "excel") {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="complaints-${Date.now()}.xlsx"`,
      },
    });
  }

  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h as keyof typeof row] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="complaints-${Date.now()}.csv"`,
    },
  });
}
