"use client";

import { ContentImage } from "@/components/ui/content-image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { GalleryMosaic } from "@/components/gallery/gallery-mosaic";
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

        <GalleryMosaic images={allImages} locale={locale} onImageClick={setLightbox} />
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
              <ContentImage
                src={lightbox.image_url}
                alt={lightbox.caption ?? "Gallery photograph"}
                className="object-contain"
                sizes={IMAGE_SIZES.lightbox}
                placeholderLabel="Image unavailable"
              />
              {lightbox.caption && (
                <p className="absolute -bottom-10 left-0 right-0 text-center text-sm text-ivory/80">
                  {locale === "ml" && lightbox.caption_ml ? lightbox.caption_ml : lightbox.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
