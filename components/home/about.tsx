"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { FadeIn } from "@/components/animations/motion";
import { timelineEvents as defaultTimeline } from "@/lib/data/demo";
import type { SiteSettings } from "@/types/database";

export function AboutSection({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("home.about");
  const locale = useLocale();
  const name = locale === "ml" ? settings.mla_name_ml : settings.mla_name;
  const biography = locale === "ml" && settings.biography_ml ? settings.biography_ml : settings.biography;
  const vision = locale === "ml" && settings.vision_ml ? settings.vision_ml : settings.vision;
  const timeline = settings.timeline ?? defaultTimeline;
  const portrait = settings.mla_portrait || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80";

  return (
    <section className="py-24 lg:py-32 bg-soft-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <FadeIn>
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal mb-8">{t("title")}</h2>
            <div className="relative aspect-[4/5] max-w-md">
              <Image
                src={portrait}
                alt={name}
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-gold/40 rounded-2xl -z-10" />
            </div>
          </FadeIn>

          <div className="space-y-12">
            <FadeIn delay={0.2}>
              <h3 className="font-display text-2xl text-charcoal mb-4">{t("biography")}</h3>
              <p className="text-muted leading-relaxed">{biography}</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <h3 className="font-display text-2xl text-charcoal mb-4">{t("vision")}</h3>
              <p className="text-muted leading-relaxed italic border-l-2 border-gold pl-6">{vision}</p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <h3 className="font-display text-2xl text-charcoal mb-8">{t("journey")}</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-8">
                  {timeline.map((event, i) => (
                    <div key={i} className="relative pl-12">
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-soft-white" />
                      <span className="text-gold text-sm font-medium">{event.year}</span>
                      <p className="text-charcoal mt-1">
                        {locale === "ml" ? event.title_ml : event.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
