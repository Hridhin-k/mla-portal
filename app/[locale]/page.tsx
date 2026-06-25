import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about";
import { ImpactSection } from "@/components/home/impact";
import { ProjectsPreview } from "@/components/home/projects-preview";
import { NewsPreview } from "@/components/home/news-preview";
import {
  ParticipationSection,
  GalleryPreview,
  TestimonialsSection,
  OfficePreview,
} from "@/components/home/sections";
import { getSettings, getProjects, getNews, getGalleryPreview } from "@/lib/data/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("siteName"),
    description: t("siteDescription"),
    openGraph: {
      title: t("siteName"),
      description: t("siteDescription"),
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, projects, news, galleryImages] = await Promise.all([
    getSettings(),
    getProjects({ featured: true }),
    getNews({ limit: 3 }),
    getGalleryPreview(6),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <ImpactSection settings={settings} />
      <ProjectsPreview projects={projects} />
      <NewsPreview news={news} />
      <ParticipationSection />
      <GalleryPreview images={galleryImages} />
      <TestimonialsSection settings={settings} />
      <OfficePreview settings={settings} />
    </>
  );
}
