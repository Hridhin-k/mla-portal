"use client";

import { useTranslations } from "next-intl";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/motion";
import { AnimatedCounter } from "@/components/animations/counter";
import type { SiteSettings } from "@/types/database";

export function ImpactSection({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("home.impact");
  const stats = [
    { key: "roads", value: settings.stats.roads_completed },
    { key: "schools", value: settings.stats.schools_upgraded },
    { key: "healthcare", value: settings.stats.healthcare_projects },
    { key: "welfare", value: settings.stats.welfare_initiatives },
  ] as const;

  return (
    <section className="py-24 lg:py-32 editorial-gradient">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StaggerItem key={stat.key}>
              <div className="glass-card rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-500">
                <div className="font-display text-4xl md:text-5xl font-medium text-charcoal mb-2">
                  <AnimatedCounter value={stat.value} />
                  <span className="text-emerald text-2xl">+</span>
                </div>
                <p className="text-sm text-muted uppercase tracking-wider">{t(stat.key)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
