import React, { useEffect, useState } from 'react';

interface ImageCarouselProps {
  projectId: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ projectId }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch & cache images
  useEffect(() => {
    const cached = localStorage.getItem(`projectImages-${projectId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setImages(parsed);
      preloadImages(parsed);
    } else {
      fetchImages();
    }
  }, [projectId]);

  // Preload images for instant switching
  const preloadImages = (urls: string[]) => {
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/houseprojects/${projectId}`);
      const data = await response.json();

      const allImages = [data.thumbnail, ...data.additionalImages];
      setImages(allImages);
      preloadImages(allImages);
      localStorage.setItem(`projectImages-${projectId}`, JSON.stringify(allImages));
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
      />

      {/* Navigation */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
      >
        ▶
      </button>

      {/* Thumbnails */}
      <div className="flex mt-2 gap-2 overflow-x-auto">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Thumbnail ${idx + 1}`}
            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
              idx === currentIndex ? 'border-green-500' : 'border-gray-300'
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
