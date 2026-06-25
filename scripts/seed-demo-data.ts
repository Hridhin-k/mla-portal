import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import {
  defaultSettings,
  demoProjects,
  demoNews,
  demoGallery,
  demoComplaints,
} from "../lib/data/demo";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Seeding site settings...");
  const { error: settingsError } = await supabase
    .from("settings")
    .upsert({ key: "site", value: defaultSettings }, { onConflict: "key" });
  if (settingsError) throw settingsError;

  console.log(`Seeding ${demoProjects.length} projects...`);
  for (const project of demoProjects) {
    const { id: _id, created_at: _ca, updated_at: _ua, ...row } = project;
    const { error } = await supabase.from("projects").upsert(row, { onConflict: "slug" });
    if (error) throw error;
  }

  console.log(`Seeding ${demoNews.length} news articles...`);
  for (const article of demoNews) {
    const { id: _id, created_at: _ca, updated_at: _ua, author_id, ...row } = article;
    const { error } = await supabase.from("news").upsert(row, { onConflict: "slug" });
    if (error) throw error;
  }

  console.log(`Seeding ${demoGallery.length} galleries...`);
  for (const gallery of demoGallery) {
    const { id: _id, images, created_at: _ca, updated_at: _ua, ...row } = gallery;

    const { data: existing } = await supabase
      .from("gallery")
      .select("id")
      .eq("title", gallery.title)
      .maybeSingle();

    let galleryId = existing?.id;
    if (!galleryId) {
      const { data, error } = await supabase.from("gallery").insert(row).select("id").single();
      if (error) throw error;
      galleryId = data.id;
    } else {
      const { error } = await supabase.from("gallery").update(row).eq("id", galleryId);
      if (error) throw error;
    }

    await supabase.from("gallery_images").delete().eq("gallery_id", galleryId);

    const imageRows = images.map(({ id: _imgId, gallery_id: _gid, created_at: _ica, ...img }) => ({
      ...img,
      gallery_id: galleryId,
    }));

    const { error: imagesError } = await supabase.from("gallery_images").insert(imageRows);
    if (imagesError) throw imagesError;
  }

  console.log(`Seeding ${demoComplaints.length} complaints...`);
  for (const complaint of demoComplaints) {
    const { id: _id, created_at: _ca, updated_at: _ua, assigned_to, ...row } = complaint;
    const { error } = await supabase.from("complaints").upsert(row, { onConflict: "complaint_id" });
    if (error) throw error;
  }

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });
  const { count: newsCount } = await supabase.from("news").select("*", { count: "exact", head: true });
  const { count: galleryCount } = await supabase.from("gallery").select("*", { count: "exact", head: true });
  const { count: complaintCount } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true });

  console.log("Done.");
  console.log({
    projects: projectCount,
    news: newsCount,
    galleries: galleryCount,
    complaints: complaintCount,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
