import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/auth";
import { generateComplaintId } from "@/lib/utils";
import { grievanceSchema } from "@/lib/validations/grievance";
import { demoComplaints } from "@/lib/data/demo";

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = {
      citizen_name: formData.get("citizen_name") as string,
      phone: formData.get("phone") as string,
      ward: formData.get("ward") as string,
      panchayat: formData.get("panchayat") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
    };

    const parsed = grievanceSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const complaint_id = generateComplaintId();
    const files = formData.getAll("files") as File[];
    const attachments: { name: string; url: string; type: string }[] = [];

    if (isSupabaseConfigured() && files.length > 0) {
      const admin = createAdminClient();
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${complaint_id}/${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error } = await admin.storage.from("complaints").upload(path, buffer, {
          contentType: file.type,
        });
        if (!error) {
          const { data: urlData } = admin.storage.from("complaints").getPublicUrl(path);
          attachments.push({ name: file.name, url: urlData.publicUrl, type: file.type });
        }
      }
    }

    if (!isSupabaseConfigured()) {
      demoComplaints.push({
        id: crypto.randomUUID(),
        complaint_id,
        ...parsed.data,
        status: "submitted",
        attachments,
        assigned_to: null,
        remarks: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ complaint_id });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("complaints").insert({
      complaint_id,
      ...parsed.data,
      attachments,
      status: "submitted",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ complaint_id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(demoComplaints);
  }

  const { data, error } = await auth.supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
