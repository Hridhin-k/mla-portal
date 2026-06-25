"use client";

import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  AdminPageHeader,
  AdminButton,
  AdminTabs,
  AdminLoading,
} from "@/components/admin/ui";
import type { SiteSettings } from "@/types/database";
import { defaultSettings } from "@/lib/data/demo";

type Tab = "general" | "contact" | "content" | "homepage" | "stats";

export function SettingsAdmin() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("general");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.value) setSettings({ ...defaultSettings, ...data.value });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (path: string, value: unknown) => {
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SiteSettings;
      const keys = path.split(".");
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: settings }),
    });
    if (res.ok) {
      setMessage("Settings saved successfully.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Save failed.");
    }
    setSaving(false);
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "contact", label: "Contact" },
    { id: "content", label: "About & Bio" },
    { id: "homepage", label: "Homepage" },
    { id: "stats", label: "Impact Stats" },
  ];

  if (loading) return <AdminLoading />;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Site Settings"
        description="Update public-facing text, images, contact details, and homepage content."
        action={
          <AdminButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      {message && (
        <div
          className={`text-sm p-4 rounded-xl mb-6 border ${
            message.includes("success")
              ? "bg-[var(--admin-green-soft)] text-[var(--admin-green)] border-green-200"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <AdminTabs tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      <div className="admin-card p-6 space-y-5">
        {tab === "general" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="MLA Name (English)" value={settings.mla_name} onChange={(v) => set("mla_name", v)} />
              <Field label="MLA Name (Malayalam)" value={settings.mla_name_ml} onChange={(v) => set("mla_name_ml", v)} />
              <Field label="Constituency (English)" value={settings.constituency} onChange={(v) => set("constituency", v)} />
              <Field label="Constituency (Malayalam)" value={settings.constituency_ml} onChange={(v) => set("constituency_ml", v)} />
              <Field label="Tagline (English)" value={settings.tagline} onChange={(v) => set("tagline", v)} />
              <Field label="Tagline (Malayalam)" value={settings.tagline_ml} onChange={(v) => set("tagline_ml", v)} />
            </div>
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <ImageUpload label="MLA Portrait" value={settings.mla_portrait} onChange={(url) => set("mla_portrait", url)} bucket="avatars" />
              <ImageUpload label="Hero Background" value={settings.hero_image} onChange={(url) => set("hero_image", url)} bucket="avatars" folder="hero" />
            </div>
          </>
        )}

        {tab === "contact" && (
          <>
            <TextField label="Office Address" value={settings.office_address} onChange={(v) => set("office_address", v)} rows={3} />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Phone" value={settings.office_phone} onChange={(v) => set("office_phone", v)} />
              <Field label="Email" value={settings.office_email} onChange={(v) => set("office_email", v)} />
            </div>
            <Field label="Working Hours" value={settings.office_hours} onChange={(v) => set("office_hours", v)} />
          </>
        )}

        {tab === "content" && (
          <>
            <TextField label="Biography (English)" value={settings.biography} onChange={(v) => set("biography", v)} rows={5} />
            <TextField label="Biography (Malayalam)" value={settings.biography_ml ?? ""} onChange={(v) => set("biography_ml", v)} rows={5} />
            <TextField label="Vision (English)" value={settings.vision} onChange={(v) => set("vision", v)} rows={3} />
            <TextField label="Vision (Malayalam)" value={settings.vision_ml ?? ""} onChange={(v) => set("vision_ml", v)} rows={3} />
          </>
        )}

        {tab === "homepage" && (
          <>
            <p className="text-sm text-[var(--admin-muted)] -mt-2">
              Override homepage hero text. Leave blank to use default translations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Hero Greeting (EN)" value={settings.pages?.home?.hero_greeting ?? ""} onChange={(v) => set("pages.home.hero_greeting", v)} />
              <Field label="Hero Greeting (ML)" value={settings.pages?.home?.hero_greeting_ml ?? ""} onChange={(v) => set("pages.home.hero_greeting_ml", v)} />
              <Field label="Hero Title (EN)" value={settings.pages?.home?.hero_title ?? ""} onChange={(v) => set("pages.home.hero_title", v)} />
              <Field label="Hero Title (ML)" value={settings.pages?.home?.hero_title_ml ?? ""} onChange={(v) => set("pages.home.hero_title_ml", v)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Hero Subtitle (EN)" value={settings.pages?.home?.hero_subtitle ?? ""} onChange={(v) => set("pages.home.hero_subtitle", v)} rows={2} />
              <TextField label="Hero Subtitle (ML)" value={settings.pages?.home?.hero_subtitle_ml ?? ""} onChange={(v) => set("pages.home.hero_subtitle_ml", v)} rows={2} />
            </div>
          </>
        )}

        {tab === "stats" && (
          <div className="grid md:grid-cols-2 gap-4">
            {(["roads_completed", "schools_upgraded", "healthcare_projects", "welfare_initiatives"] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type="number"
                  value={settings.stats[key]}
                  onChange={(e) => set(`stats.${key}`, Number(e.target.value))}
                  className="admin-input"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="admin-input" />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="admin-textarea" rows={rows} />
    </div>
  );
}
