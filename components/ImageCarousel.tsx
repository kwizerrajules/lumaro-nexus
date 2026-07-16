'use client';
import React, { useEffect, useState } from 'react';
import { CaretLeft, CaretRight, Buildings } from '@phosphor-icons/react';
import WatermarkedImage from '@/components/WatermarkedImage';
import { watermarkImageUrls } from '@/utils/cloudinaryWatermark';

interface ImageCarouselProps {
  projectId: string;
  /** Prefer passing known URLs so the first paint is not empty */
  initialImages?: string[];
  alt?: string;
  className?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;

type CachedImages = {
  urls: string[];
  cachedAt: number;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  projectId,
  initialImages = [],
  alt = 'Plan image',
  className = '',
}) => {
  const [images, setImages] = useState<string[]>(
    watermarkImageUrls(initialImages)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const cacheKey = `projectImages-${projectId}`;

  const seedKey = initialImages.filter(Boolean).join('|');

  useEffect(() => {
    const seeded = seedKey ? watermarkImageUrls(seedKey.split('|')) : [];
    if (seeded.length) {
      setImages(seeded);
      setCurrentIndex(0);
    }
  }, [projectId, seedKey]);

  useEffect(() => {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw) as CachedImages | string[];
        const urls = Array.isArray(parsed) ? parsed : parsed.urls;
        const cachedAt = Array.isArray(parsed) ? 0 : parsed.cachedAt;
        const fresh = Date.now() - cachedAt < CACHE_TTL_MS;

        if (urls?.length && fresh) {
          setImages(watermarkImageUrls(urls));
          return;
        }
      } catch {
        // fall through
      }
    }
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `/api/houseprojects/${encodeURIComponent(projectId)}`
      );
      const data = await response.json();
      const allImages = watermarkImageUrls([
        data.thumbnail,
        ...(data.additionalImages || []),
      ]);
      if (allImages.length) {
        setImages(allImages);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            urls: allImages,
            cachedAt: Date.now(),
          } satisfies CachedImages)
        );
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handlePrev = () => {
    if (images.length < 2) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length < 2) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const current = images[currentIndex];

  return (
    <div className={className}>
      {/* Fixed preview box — never grows with image dimensions */}
      <div className="relative w-full h-[240px] sm:h-[300px] lg:h-[380px] overflow-hidden bg-stone-100 border border-brand-line">
        {current ? (
          <WatermarkedImage
            src={current}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <Buildings size={40} />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900/90 transition-colors"
              aria-label="Previous image"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900/90 transition-colors"
              aria-label="Next image"
            >
              <CaretRight size={18} weight="bold" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-neutral-900/70 text-white text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex mt-2 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-2 transition-colors ${
                idx === currentIndex
                  ? 'border-amber-600'
                  : 'border-stone-300 hover:border-stone-400'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <WatermarkedImage
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
                hideSticker
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
