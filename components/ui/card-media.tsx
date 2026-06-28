import type { ReactNode } from "react";
import { ContentImage } from "@/components/ui/content-image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";

/** Padding-top % = height / width × 100 — stable box for fill images. */
const aspectPadding = {
  "16/10": "62.5%",
  "16/9": "56.25%",
  "4/3": "75%",
  video: "56.25%",
  square: "100%",
} as const;

type CardMediaProps = {
  src?: string | null;
  alt: string;
  sizes?: string;
  aspect?: keyof typeof aspectPadding;
  className?: string;
  imageClassName?: string;
  placeholderLabel?: string;
  priority?: boolean;
  overlay?: ReactNode;
};

/** Fixed-ratio image frame for cards — prevents collapsed thumbnails when using fill images. */
export function CardMedia({
  src,
  alt,
  sizes = IMAGE_SIZES.cardGrid3,
  aspect = "16/10",
  className,
  imageClassName,
  placeholderLabel,
  priority,
  overlay,
}: CardMediaProps) {
  return (
    <div
      className={cn("relative isolate w-full shrink-0 overflow-hidden bg-stone", className)}
      style={{ paddingTop: aspectPadding[aspect] }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <ContentImage
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          placeholderLabel={placeholderLabel}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700",
            imageClassName
          )}
        />
        {overlay}
      </div>
    </div>
  );
}
