"use client";

import type { CSSProperties } from "react";
import { ContentImage } from "@/components/ui/content-image";
import { FadeIn } from "@/components/animations/motion";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getGallerySpans } from "@/lib/gallery-layout";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/database";

type GalleryMosaicProps = {
  images: GalleryImage[];
  locale: string;
  onImageClick?: (image: GalleryImage) => void;
  className?: string;
  animate?: boolean;
};

function tileVars(
  smCol: number,
  smRow: number,
  lgCol: number,
  lgRow: number,
  mobileAspect: string
): CSSProperties {
  return {
    ["--span-sm-col" as string]: smCol,
    ["--span-sm-row" as string]: smRow,
    ["--span-lg-col" as string]: lgCol,
    ["--span-lg-row" as string]: lgRow,
    ["--tile-aspect" as string]: mobileAspect,
  };
}

export function GalleryMosaic({
  images,
  locale,
  onImageClick,
  className,
  animate = true,
}: GalleryMosaicProps) {
  if (images.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-stone px-6 py-16 text-center text-muted">
        No photos in this category yet.
      </p>
    );
  }

  const layout = getGallerySpans(images.length);

  return (
    <div className={cn("gallery-bento", className)}>
      {images.map((img, i) => {
        const caption =
          img.caption && locale === "ml" && img.caption_ml ? img.caption_ml : img.caption;
        const sm = layout.sm[i];
        const lg = layout.lg[i];
        const style = tileVars(sm.col, sm.row, lg.col, lg.row, layout.mobileAspects[i]);

        const inner = (
          <button
            type="button"
            onClick={() => onImageClick?.(img)}
            className="group relative block h-full min-h-full w-full overflow-hidden rounded-lg bg-stone text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            <ContentImage
              src={img.image_url}
              alt={caption ?? "Gallery photograph"}
              className="object-cover object-center"
              sizes={IMAGE_SIZES.galleryTile}
              placeholderLabel="Gallery photo"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
            {caption && (
              <p className="pointer-events-none absolute bottom-0 left-0 right-0 p-3 text-sm text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 line-clamp-2">
                {caption}
              </p>
            )}
          </button>
        );

        if (!animate) {
          return (
            <article key={img.id} className="gallery-bento-tile" style={style}>
              {inner}
            </article>
          );
        }

        return (
          <FadeIn
            key={img.id}
            delay={Math.min(i * 0.03, 0.35)}
            className="gallery-bento-tile"
            style={style}
          >
            {inner}
          </FadeIn>
        );
      })}
    </div>
  );
}
