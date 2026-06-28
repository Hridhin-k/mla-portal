"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { imageAlt } from "@/lib/image-utils";
import { IMAGE_SIZES } from "@/lib/image-sizes";

type ContentImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholderLabel?: string;
};

export function ContentImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  sizes,
  priority,
  placeholderLabel,
}: ContentImageProps) {
  const [broken, setBroken] = useState(false);
  const resolvedAlt = imageAlt(alt, placeholderLabel);
  const imageSrc = src?.trim();
  const showPlaceholder = !imageSrc || broken;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-stone text-muted",
          fill && "absolute inset-0",
          className
        )}
        role="img"
        aria-label={resolvedAlt}
      >
        <div className="px-4 text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-35" aria-hidden />
          {placeholderLabel && (
            <p className="text-xs leading-snug opacity-55">{placeholderLabel}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={resolvedAlt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      sizes={sizes ?? (fill ? IMAGE_SIZES.cardGrid3 : undefined)}
      priority={priority}
      onError={() => setBroken(true)}
    />
  );
}
