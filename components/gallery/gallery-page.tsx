"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import type { Gallery, GalleryImage } from "@/types/database";

const categories = ["development", "public_meetings", "welfare", "events"] as const;

export function GalleryPageClient({ galleries }: { galleries: (Gallery & { images: GalleryImage[] })[] }) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const allImages = galleries
    .filter((g) => category === "all" || g.category === category)
    .flatMap((g) => g.images);

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-wrap gap-2 mb-12">
          <button onClick={() => setCategory("all")} className={`px-4 py-2 rounded-full text-sm ${category === "all" ? "bg-charcoal text-ivory" : "bg-stone"}`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm ${category === cat ? "bg-charcoal text-ivory" : "bg-stone"}`}>
              {t(`categories.${cat}`)}
            </button>
          ))}
        </FadeIn>

        <div className="masonry-grid">
          {allImages.map((img, i) => (
            <FadeIn key={img.id} delay={i * 0.03} className="masonry-item">
              <button
                onClick={() => setLightbox(img)}
                className="group w-full rounded-xl overflow-hidden cursor-pointer"
              >
                <div className={`relative overflow-hidden ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
                  <Image src={img.image_url} alt={img.caption ?? ""} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-end p-4">
                    {img.caption && (
                      <p className="text-ivory text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {locale === "ml" && img.caption_ml ? img.caption_ml : img.caption}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-ivory p-2" onClick={() => setLightbox(null)}>
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[85vh] w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={lightbox.image_url} alt={lightbox.caption ?? ""} fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
