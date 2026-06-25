import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/animations/motion";
import { GrievanceForm } from "@/components/grievance/grievance-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "grievance" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function GrievancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("grievance");

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </FadeIn>
        <GrievanceForm />
      </div>
    </div>
  );
}
