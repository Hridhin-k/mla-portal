/**
 * `sizes` hints for next/image — aligned to rendered layout widths.
 *
 * Public content uses max-w-7xl (1280px) + horizontal padding.
 * These values tell the browser which srcset width to download,
 * avoiding oversized images on cards and undersized images on heroes.
 */
export const IMAGE_SIZES = {
  /** Full-bleed: homepage hero, project detail banner, decorative backgrounds */
  viewport: "100vw",

  /** Article column max-w-3xl (~768px) */
  article: "(max-width: 768px) 100vw, 768px",

  /**
   * Standard card grids: md:grid-cols-2 lg:grid-cols-3
   * (projects list, news list, home project preview)
   */
  cardGrid3: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px",

  /**
   * Featured half-width cards: lg:grid-cols-2
   * (home news hero, news page featured)
   */
  cardFeaturedHalf: "(max-width: 1024px) 100vw, 600px",

  /** Compact row thumbnail — w-32 (128px) */
  newsThumb: "128px",

  /**
   * Gallery masonry: 1 col mobile, 2 col sm, 3 col lg
   */
  galleryTile: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",

  /** Two-up grids: before/after, news featured image column */
  splitHalf: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px",

  /** Related items row: md:grid-cols-3 inside max-w-7xl */
  relatedCard3: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px",

  /** MLA portrait — max-w-md in lg:grid-cols-2 */
  portrait: "(max-width: 1024px) 90vw, 448px",

  /** Admin album cards: md:grid-cols-2 xl:grid-cols-3 */
  adminAlbumCard: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px",

  /** Admin upload preview — max-w-xs aspect-video */
  adminPreview: "320px",

  /** Admin gallery photo grid: grid-cols-2 sm:grid-cols-3 */
  adminGalleryThumb: "(max-width: 640px) 50vw, 220px",

  /** Full-screen lightbox */
  lightbox: "100vw",
} as const;

export type ImageSizeKey = keyof typeof IMAGE_SIZES;
