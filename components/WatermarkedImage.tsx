'use client';
import React from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  watermarkImageUrl,
  type WatermarkMode,
} from '@/utils/cloudinaryWatermark';

type WatermarkedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /**
   * Display bake-in:
   * - preview (default): corners + sides
   * - light: 4 corners only
   * Dense full-grid marks are downloaded on Save / right-click.
   */
  mode?: Exclude<WatermarkMode, 'dense'>;
  /** Kept for API compat. */
  hideSticker?: boolean;
};

/**
 * Shows a clean corner/side watermark on the page.
 * Right-click / save downloads a densely watermarked file instead.
 */
const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  mode = 'preview',
  hideSticker: _hideSticker = false,
  alt,
  className,
  ...rest
}) => {
  const displaySrc = watermarkImageUrl(src, mode);
  const denseSrc = watermarkImageUrl(src, 'dense');

  const downloadDense = async () => {
    try {
      const res = await fetch(denseSrc);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'lumaro-nexus-preview.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('[watermark] dense download failed', err);
      window.open(denseSrc, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
        void downloadDense();
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          'DownloadURL',
          `image/jpeg:lumaro-nexus-preview.jpg:${window.location.origin}${denseSrc.startsWith('/') ? denseSrc : `/${denseSrc}`}`
        );
        e.dataTransfer.setData(
          'text/uri-list',
          denseSrc.startsWith('http')
            ? denseSrc
            : `${window.location.origin}${denseSrc}`
        );
      }}
    >
      <Image
        src={displaySrc}
        alt={alt}
        {...rest}
        className={className}
        unoptimized
        draggable
      />
    </div>
  );
};

export default WatermarkedImage;
