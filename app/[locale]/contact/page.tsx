import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSettings } from "@/lib/data/queries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await getSettings();

  const contactItems = [
    { icon: MapPin, label: t("office"), value: settings.office_address },
    { icon: Phone, label: "Phone", value: settings.office_phone },
    { icon: Mail, label: "Email", value: settings.office_email },
    { icon: Clock, label: "Hours", value: settings.office_hours },
  ];

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {contactItems.map((item) => (
              <div key={item.label} className="glass-card rounded-2xl p-6 flex gap-4">
                <item.icon className="h-5 w-5 text-gold shrink-0 mt-1" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold mb-1">{item.label}</p>
                  <p className="text-charcoal">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-display text-2xl mb-6">{t("map")}</h2>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border">
              <iframe
                src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
