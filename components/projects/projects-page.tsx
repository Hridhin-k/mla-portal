"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Search } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/types/database";

const categories = ["roads", "education", "healthcare", "water", "infrastructure"] as const;

export function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted text-lg max-w-2xl">{t("subtitle")}</p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${category === "all" ? "bg-charcoal text-ivory" : "bg-stone text-charcoal hover:bg-gold/20"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${category === cat ? "bg-charcoal text-ivory" : "bg-stone text-charcoal hover:bg-gold/20"}`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project, i) => (
            <FadeIn key={project.id} delay={i * 0.05}>
              <Link href={`/projects/${project.slug}`} className="group block">
                <article className="overflow-hidden rounded-2xl bg-soft-white border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {project.featured_image && (
                      <Image src={project.featured_image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-charcoal/80 text-ivory text-xs px-3 py-1 rounded-full">
                        {t(`statuses.${project.status}`)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-emerald text-xs uppercase tracking-wider">{t(`categories.${project.category}`)}</span>
                    <h2 className="font-display text-xl text-charcoal mt-2 mb-3 group-hover:text-gold transition-colors">
                      {locale === "ml" && project.title_ml ? project.title_ml : project.title}
                    </h2>
                    {project.location && <p className="text-sm text-muted mb-4">{project.location}</p>}
                    <Progress value={project.progress} />
                    <p className="text-xs text-emerald mt-2">{project.progress}%</p>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
