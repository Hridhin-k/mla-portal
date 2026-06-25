"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/motion";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/types/database";

export function ProjectsPreview({ projects }: { projects: Project[] }) {
  const t = useTranslations("home.projects");
  const tProjects = useTranslations("projects");
  const locale = useLocale();

  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
            <p className="text-muted mt-4 max-w-lg">{t("subtitle")}</p>
          </div>
          <Link href="/projects" className="text-gold hover:text-brass transition-colors flex items-center gap-2 text-sm font-medium">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project) => (
            <StaggerItem key={project.id}>
              <Link href={`/projects/${project.slug}`} className="group block">
                <article className="overflow-hidden rounded-2xl bg-soft-white border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {project.featured_image && (
                      <Image
                        src={project.featured_image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-charcoal/80 text-ivory text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        {tProjects(`categories.${project.category}`)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl text-charcoal mb-2 group-hover:text-gold transition-colors">
                      {locale === "ml" && project.title_ml ? project.title_ml : project.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-4">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-xs text-emerald font-medium">{project.progress}%</span>
                    </div>
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
