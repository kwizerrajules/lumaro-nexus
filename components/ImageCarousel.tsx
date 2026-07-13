import React, { useEffect, useState } from 'react';

interface ImageCarouselProps {
  projectId: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes — URL list only; image bytes come from Cloudinary CDN

type CachedImages = {
  urls: string[];
  cachedAt: number;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ projectId }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cacheKey = `projectImages-${projectId}`;

  // Fetch URL list (with short localStorage cache). Actual image bytes are
  // loaded from Cloudinary CDN and cached by the browser — not via an app image API.
  useEffect(() => {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw) as CachedImages | string[];
        // Support legacy cache format (plain string[])
        const urls = Array.isArray(parsed) ? parsed : parsed.urls;
        const cachedAt = Array.isArray(parsed) ? 0 : parsed.cachedAt;
        const fresh = Date.now() - cachedAt < CACHE_TTL_MS;

        if (urls?.length && fresh) {
          setImages(urls);
          preloadImages(urls);
          return;
        }
      } catch {
        // fall through to fetch
      }
    }
    fetchImages();
  }, [projectId]);

  const preloadImages = (urls: string[]) => {
    urls.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/houseprojects/${projectId}`);
      const data = await response.json();

      const allImages = [data.thumbnail, ...(data.additionalImages || [])].filter(
        Boolean
      ) as string[];
      setImages(allImages);
      preloadImages(allImages);
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ urls: allImages, cachedAt: Date.now() } satisfies CachedImages)
      );
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages(['/placeholder-house-1.jpg', '/placeholder-house-2.jpg']);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) return <div>Loading images...</div>;

  return (
    <div className="relative w-full">
      <img
        src={images[currentIndex]}
        alt={`Project image ${currentIndex + 1}`}
        className="w-full h-auto rounded-lg object-cover"
        loading="eager"
        decoding="async"
        // Cloudinary CDN serves Cache-Control; browser reuses bytes on refresh
        referrerPolicy="no-referrer-when-downgrade"
      />

      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        type="button"
        aria-label="Previous image"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        type="button"
        aria-label="Next image"
      >
        ▶
      </button>

      <div className="flex mt-2 gap-2 overflow-x-auto">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Thumbnail ${idx + 1}`}
            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
              idx === currentIndex ? 'border-green-500' : 'border-gray-300'
            }`}
            loading="lazy"
            decoding="async"
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
