'use client';
import React from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  watermarkImageUrl,
  type WatermarkMode,
} from '@/utils/cloudinaryWatermark';

type WatermarkedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /** Cloudinary bake-in strength; CSS sticker always shows for non-Cloudinary. */
  mode?: WatermarkMode;
  /** Hide the on-screen sticker (Cloudinary bake-in still applies). */
  hideSticker?: boolean;
};

const TILE_POSITIONS = [
  'top-[12%] left-[8%]',
  'top-[12%] left-1/2 -translate-x-1/2',
  'top-[12%] right-[8%]',
  'bottom-[14%] left-[8%]',
  'bottom-[14%] left-1/2 -translate-x-1/2',
  'bottom-[14%] right-[8%]',
] as const;

/**
 * Public-facing image: Cloudinary URL gets a baked-in watermark grid,
 * plus a CSS tile fallback for non-Cloudinary hosts.
 */
const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  mode = 'preview',
  hideSticker = false,
  alt,
  className,
  ...rest
}) => {
  const markedSrc = watermarkImageUrl(src, mode);
  const useCssSticker = !hideSticker && !src.includes('res.cloudinary.com');

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={markedSrc}
        alt={alt}
        {...rest}
        className={className}
        unoptimized
      />
      {useCssSticker && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {TILE_POSITIONS.map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} select-none font-display font-semibold tracking-wide text-white/30 rotate-[-28deg] whitespace-nowrap ${
                mode === 'light' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg md:text-xl'
              }`}
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}
            >
              Lumaro Nexus
            </span>
          ))}
          <span className="absolute bottom-2 right-2 select-none rounded bg-neutral-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Preview
          </span>
        </div>
      )}
    </div>
  );
};

export default WatermarkedImage;
