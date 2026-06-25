"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/motion";
import { formatDate } from "@/lib/utils";
import type { News } from "@/types/database";

export function NewsPreview({ news }: { news: News[] }) {
  const t = useTranslations("home.news");
  const tNews = useTranslations("news");
  const locale = useLocale();
  const featured = news.find((n) => n.is_featured) ?? news[0];
  const rest = news.filter((n) => n.id !== featured?.id).slice(0, 2);

  return (
    <section className="py-24 lg:py-32 bg-soft-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8">
          {featured && (
            <FadeIn>
              <Link href={`/news/${featured.slug}`} className="group block">
                <article className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  {featured.featured_image && (
                    <Image src={featured.featured_image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-0 p-8">
                    <span className="text-gold text-xs uppercase tracking-wider">{tNews("featured")}</span>
                    <h3 className="font-display text-2xl md:text-3xl text-ivory mt-2 group-hover:text-gold transition-colors">
                      {locale === "ml" && featured.title_ml ? featured.title_ml : featured.title}
                    </h3>
                    {featured.published_at && (
                      <p className="text-ivory/60 text-sm mt-2">{formatDate(featured.published_at, locale)}</p>
                    )}
                  </div>
                </article>
              </Link>
            </FadeIn>
          )}

          <StaggerContainer className="flex flex-col gap-6">
            {rest.map((item) => (
              <StaggerItem key={item.id}>
                <Link href={`/news/${item.slug}`} className="group flex gap-6 items-center">
                  <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0">
                    {item.featured_image && (
                      <Image src={item.featured_image} alt={item.title} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <span className="text-emerald text-xs uppercase tracking-wider">
                      {tNews(`categories.${item.category}`)}
                    </span>
                    <h3 className="font-display text-lg text-charcoal mt-1 group-hover:text-gold transition-colors">
                      {locale === "ml" && item.title_ml ? item.title_ml : item.title}
                    </h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
            <Link href="/news" className="text-gold hover:text-brass transition-colors flex items-center gap-2 text-sm font-medium mt-4">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
