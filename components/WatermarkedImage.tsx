'use client';
import React from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  watermarkImageUrl,
  type WatermarkMode,
} from '@/utils/cloudinaryWatermark';

type WatermarkedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /** Bake-in strength for Cloudinary / proxy. */
  mode?: WatermarkMode;
  /** Kept for API compat; bake-in always applies so CSS overlay is unused. */
  hideSticker?: boolean;
};

/**
 * Public-facing image with watermark baked into the file bytes
 * (Cloudinary transforms or /api/watermarked proxy).
 * "Save image as" therefore includes the mark.
 */
const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  mode = 'preview',
  hideSticker: _hideSticker = false,
  alt,
  className,
  ...rest
}) => {
  const markedSrc = watermarkImageUrl(src, mode);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={markedSrc}
        alt={alt}
        {...rest}
        className={className}
        unoptimized
      />
    </div>
  );
};

export default WatermarkedImage;
