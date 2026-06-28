export type GallerySpan = { col: number; row: number };

/** Desktop bands — each fills exactly 12 columns × 4 rows (no holes). */
const BANDS_12: GallerySpan[][] = [
  // A: large left anchor + mixed right
  [
    { col: 6, row: 2 },
    { col: 3, row: 2 },
    { col: 3, row: 2 },
    { col: 5, row: 2 },
    { col: 4, row: 2 },
    { col: 3, row: 2 },
  ],
  // B: uneven split top, staggered bottom
  [
    { col: 7, row: 2 },
    { col: 5, row: 2 },
    { col: 3, row: 2 },
    { col: 5, row: 2 },
    { col: 4, row: 2 },
  ],
  // C: tall portrait block + side mosaic
  [
    { col: 5, row: 3 },
    { col: 4, row: 1 },
    { col: 3, row: 1 },
    { col: 4, row: 2 },
    { col: 3, row: 2 },
    { col: 5, row: 1 },
    { col: 7, row: 1 },
  ],
  // D: cinematic wide + small tiles
  [
    { col: 8, row: 2 },
    { col: 4, row: 1 },
    { col: 4, row: 1 },
    { col: 3, row: 2 },
    { col: 5, row: 2 },
    { col: 4, row: 2 },
  ],
];

/** Tablet bands — each fills 4 columns × 2–3 rows. */
const BANDS_4: GallerySpan[][] = [
  [
    { col: 2, row: 2 },
    { col: 2, row: 1 },
    { col: 2, row: 1 },
    { col: 4, row: 1 },
  ],
  [
    { col: 3, row: 2 },
    { col: 1, row: 1 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 2, row: 2 },
  ],
  [
    { col: 4, row: 2 },
    { col: 2, row: 1 },
    { col: 2, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 1 },
  ],
];

/** Mobile-only aspect ratios for vertical rhythm (no grid spans). */
export const MOBILE_TILE_ASPECTS = [
  "4 / 3",
  "3 / 4",
  "16 / 10",
  "1 / 1",
  "5 / 4",
  "3 / 2",
] as const;

const FILLER_12: Record<number, GallerySpan[]> = {
  1: [{ col: 12, row: 2 }],
  2: [
    { col: 8, row: 2 },
    { col: 4, row: 2 },
  ],
  3: [
    { col: 5, row: 2 },
    { col: 4, row: 2 },
    { col: 3, row: 2 },
  ],
  4: [
    { col: 8, row: 3 },
    { col: 4, row: 1 },
    { col: 4, row: 1 },
    { col: 4, row: 1 },
  ],
  5: BANDS_12[1],
};

const FILLER_4: Record<number, GallerySpan[]> = {
  1: [{ col: 4, row: 2 }],
  2: [
    { col: 3, row: 2 },
    { col: 1, row: 2 },
  ],
  3: [
    { col: 2, row: 2 },
    { col: 1, row: 1 },
    { col: 1, row: 1 },
  ],
};

function fillerSpans(remaining: number, columns: 4 | 12): GallerySpan[] {
  const map = columns === 12 ? FILLER_12 : FILLER_4;
  const preset = map[remaining];
  if (preset) return preset;

  const spans: GallerySpan[] = [];
  let left = remaining;
  let toggle = 0;
  while (left > 0) {
    if (columns === 12 && left >= 2) {
      spans.push({ col: toggle % 2 === 0 ? 7 : 5, row: 1 });
      left -= 1;
      toggle++;
    } else {
      const col = columns === 12 ? 4 : 2;
      spans.push({ col, row: 1 });
      left -= 1;
    }
  }
  return spans;
}

function spansForCount(count: number, columns: 4 | 12, bands: GallerySpan[][]): GallerySpan[] {
  const spans: GallerySpan[] = [];
  let i = 0;
  let bandIndex = 0;

  while (i < count) {
    const band = bands[bandIndex % bands.length];
    const left = count - i;

    if (left < band.length) {
      spans.push(...fillerSpans(left, columns));
      break;
    }

    spans.push(...band);
    i += band.length;
    bandIndex += 1;
  }

  return spans;
}

export function getGallerySpans(count: number): {
  sm: GallerySpan[];
  lg: GallerySpan[];
  mobileAspects: string[];
} {
  return {
    sm: spansForCount(count, 4, BANDS_4),
    lg: spansForCount(count, 12, BANDS_12),
    mobileAspects: Array.from(
      { length: count },
      (_, i) => MOBILE_TILE_ASPECTS[i % MOBILE_TILE_ASPECTS.length]
    ),
  };
}
