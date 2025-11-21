import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
  projectId: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ projectId }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  // Fetch project images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/houseprojects/${projectId}`);
        const data = await response.json();
        const allImages = [
          data.thumbnail,
          ...data.additionalImages
        ];
        console.log("All images", allImages)
        setImages(allImages || []);
      } catch (error) {
        // Fallback images
        setImages([
          '/placeholder-house-1.jpg',
          '/placeholder-house-2.jpg',
          '/placeholder-house-3.jpg',
        ]);
      }
    };
    fetchImages();
  }, [projectId]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-50 rounded-lg overflow-hidden">
      {/* Main Image */}
      <img
        src={images[currentImage]}
        alt={`Project view ${currentImage + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImage ? 'bg-green-500' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {currentImage + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageCarousel;
