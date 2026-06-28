"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/animations/motion";
import type { SiteSettings } from "@/types/database";

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const name = locale === "ml" ? settings.mla_name_ml : settings.mla_name;
  const constituency = locale === "ml" ? settings.constituency_ml : settings.constituency;

  const home = settings.pages?.home;
  const greeting = locale === "ml"
    ? (home?.hero_greeting_ml || t("greeting"))
    : (home?.hero_greeting || t("greeting"));
  const title = locale === "ml"
    ? (home?.hero_title_ml || t("title"))
    : (home?.hero_title || t("title"));
  const subtitle = locale === "ml"
    ? (home?.hero_subtitle_ml || t("subtitle"))
    : (home?.hero_subtitle || t("subtitle"));
  const heroImage = settings.hero_image || "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1920&q=80";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Kerala landscape"
          fill
          className="object-cover"
          priority
          sizes={IMAGE_SIZES.viewport}
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-charcoal/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-8 w-full">
        <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gold text-sm uppercase tracking-[0.3em] mb-6"
            >
              {greeting}
            </motion.p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-ivory leading-[1.1] mb-6">
              <TextReveal text={title} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-ivory/80 text-lg md:text-xl max-w-lg leading-relaxed mb-4"
            >
              {subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-gold/90 text-sm mb-10"
            >
              {name} · {constituency}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/projects">
                <Button variant="gold" size="lg">
                  {t("ctaProjects")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/grievance">
                <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10 hover:text-ivory">
                  {t("ctaGrievance")}
                </Button>
              </Link>
            </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory/60"
      >
        <span className="text-xs uppercase tracking-widest">{t("scroll")}</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}
