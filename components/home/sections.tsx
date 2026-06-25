"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, MessageSquare } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Button } from "@/components/ui/button";
import { testimonials as defaultTestimonials } from "@/lib/data/demo";
import type { SiteSettings } from "@/types/database";
import type { GalleryImage } from "@/types/database";

export function ParticipationSection() {
  const t = useTranslations("home.participation");

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal" />
      <div className="absolute inset-0 opacity-20">
        <Image src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80" alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <FadeIn>
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-ivory mb-6">{t("title")}</h2>
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto mb-12">{t("subtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/grievance">
              <Button variant="gold" size="lg">
                <MessageSquare className="h-4 w-4" />
                {t("ctaGrievance")}
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                {t("ctaTrack")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function GalleryPreview({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("home.gallery");

  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
        </FadeIn>
        <div className="masonry-grid">
          {images.map((img, i) => (
            <FadeIn key={img.id} delay={i * 0.1} className="masonry-item">
              <Link href="/gallery" className="group block rounded-xl overflow-hidden">
                <div className={`relative overflow-hidden rounded-xl ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
                  <Image
                    src={img.image_url}
                    alt={img.caption ?? ""}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-500" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("home.testimonials");
  const locale = useLocale();
  const testimonials = settings.testimonials ?? defaultTestimonials;

  return (
    <section className="py-24 lg:py-32 bg-stone">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <blockquote className="glass-card rounded-2xl p-8 h-full">
                <p className="text-charcoal/80 leading-relaxed italic mb-6">
                  &ldquo;{locale === "ml" ? item.quote_ml : item.quote}&rdquo;
                </p>
                <footer>
                  <cite className="not-italic font-medium text-charcoal">{item.author}</cite>
                  <p className="text-sm text-muted">{item.role}</p>
                </footer>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OfficePreview({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("home.office");

  return (
    <section className="py-24 lg:py-32 bg-soft-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">{t("label")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-charcoal">{t("title")}</h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-8">
          <FadeIn className="space-y-6">
            {[
              { label: t("address"), value: settings.office_address },
              { label: t("phone"), value: settings.office_phone },
              { label: t("email"), value: settings.office_email },
              { label: t("hours"), value: settings.office_hours },
            ].map((item) => (
              <div key={item.label} className="border-b border-border pb-4">
                <p className="text-xs uppercase tracking-wider text-gold mb-1">{item.label}</p>
                <p className="text-charcoal">{item.value}</p>
              </div>
            ))}
            <Link href="/contact">
              <Button variant="gold">{t("label")}</Button>
            </Link>
          </FadeIn>
          <FadeIn delay={0.2}>
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
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
