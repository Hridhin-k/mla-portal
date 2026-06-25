"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Search } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { News } from "@/types/database";

const categories = ["announcement", "development", "welfare", "events", "general"] as const;

export function NewsPageClient({ news }: { news: News[] }) {
  const t = useTranslations("news");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = news.filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || n.category === category;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.find((n) => n.is_featured) ?? filtered[0];
  const rest = filtered.filter((n) => n.id !== featured?.id);

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory("all")} className={`px-4 py-2 rounded-full text-sm ${category === "all" ? "bg-charcoal text-ivory" : "bg-stone"}`}>All</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm ${category === cat ? "bg-charcoal text-ivory" : "bg-stone"}`}>
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </FadeIn>

        {featured && (
          <FadeIn className="mb-12">
            <Link href={`/news/${featured.slug}`} className="group block">
              <article className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
                  {featured.featured_image && <Image src={featured.featured_image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 66vw" />}
                </div>
                <div>
                  <span className="text-gold text-xs uppercase tracking-wider">{t("featured")}</span>
                  <h2 className="font-display text-3xl md:text-4xl text-charcoal mt-2 group-hover:text-gold transition-colors">
                    {locale === "ml" && featured.title_ml ? featured.title_ml : featured.title}
                  </h2>
                  <p className="text-muted mt-4 leading-relaxed">
                    {locale === "ml" && featured.excerpt_ml ? featured.excerpt_ml : featured.excerpt}
                  </p>
                  {featured.published_at && <p className="text-sm text-muted mt-4">{formatDate(featured.published_at, locale)}</p>}
                </div>
              </article>
            </Link>
          </FadeIn>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.05}>
              <Link href={`/news/${item.slug}`} className="group block">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                  {item.featured_image && <Image src={item.featured_image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />}
                </div>
                <span className="text-emerald text-xs uppercase tracking-wider">{t(`categories.${item.category}`)}</span>
                <h3 className="font-display text-xl mt-1 group-hover:text-gold transition-colors">
                  {locale === "ml" && item.title_ml ? item.title_ml : item.title}
                </h3>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
