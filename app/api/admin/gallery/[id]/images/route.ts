import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id: gallery_id } = await params;
  const body = await request.json();

  const images: { image_url: string; caption?: string; caption_ml?: string }[] =
    body.images ?? (body.image_url ? [body] : []);

  if (images.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const { data: existing } = await auth.supabase
    .from("gallery_images")
    .select("sort_order")
    .eq("gallery_id", gallery_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  let nextOrder = ((existing as { sort_order: number }[] | null)?.[0]?.sort_order ?? -1) + 1;

  const rows = images.map((img) => ({
    gallery_id,
    image_url: img.image_url,
    caption: img.caption ?? null,
    caption_ml: img.caption_ml ?? null,
    sort_order: nextOrder++,
  }));

  const { data, error } = await auth.supabase
    .from("gallery_images")
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (images.length > 0 && images[0].image_url) {
    const { data: album } = await auth.supabase
      .from("gallery")
      .select("cover_image")
      .eq("id", gallery_id)
      .single();

    if (!(album as { cover_image: string | null } | null)?.cover_image) {
      await auth.supabase
        .from("gallery")
        .update({ cover_image: images[0].image_url })
        .eq("id", gallery_id);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
