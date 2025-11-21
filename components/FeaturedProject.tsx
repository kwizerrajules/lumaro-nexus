import React, { useState, useEffect } from 'react';

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  featuredText: string;
  photoTopic: string;
  category: string;
  tags: string[];
}

const FeaturedProject: React.FC = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch first 4 featured projects from API
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await fetch('/api/houseprojects');
        const data = await response.json();
        const firstFour: FeaturedProject[] = (data.data || []).slice(0, 4);

        if (firstFour.length > 0) {
          setProjects(firstFour);
          preloadImages(firstFour.map(p => p.thumbnail));
        } else {
          // Fallback project
          setProjects([{
            id: '49801',
            title: 'Luxury 2 Bedroom Apartments',
            description: 'Premium apartment complex with modern amenities and stunning architectural design.',
            thumbnail: 'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_960_720.jpg',
            price: 985,
            bedrooms: 2,
            bathrooms: 2,
            areaSqFt: 85,
            featuredText: '🏆 Project of the Month',
            photoTopic: 'Modern Urban Living',
            category: 'Apartment Complex',
            tags: ['Modern', 'Luxury', 'Urban', 'Sustainable']
          }]);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Rotate featured project every 1 minute
  useEffect(() => {
    if (!projects.length) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % projects.length);
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, [projects]);

  // Preload project images for smooth transition
  const preloadImages = (urls: string[]) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  const currentProject = projects[currentIndex];

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-black text-white transition-all duration-700 ease-in-out">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Project Image */}
          <div className="lg:w-3/4 relative">
            <div 
              className="h-96 lg:h-[500px] bg-cover bg-center relative transition-all duration-700 ease-in-out"
              style={{ backgroundImage: `url(${currentProject.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>

              <div className="absolute top-6 left-6 bg-yellow-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Discover Our Latest Innovations
              </div>

              <div className="absolute top-6 right-6 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                📸 {currentProject.photoTopic}
              </div>

              <div className="absolute bottom-6 left-6">
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">{currentProject.title}</h2>

                <div className="mb-3">
                  <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                    🏷️ {currentProject.category}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <span>🛏️</span>
                    <span>{currentProject.bedrooms} Bed</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🚿</span>
                    <span>{currentProject.bathrooms} Bath</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>📐</span>
                    <span>{currentProject.areaSqFt} m²</span>
                  </span>
                  <span className="flex items-center space-x-1 font-bold text-green-400">
                    <span>💰</span>
                    <span>${currentProject.price}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Description */}
          <div className="lg:w-1/4 bg-gray-800 p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4 text-yellow-700">Featured Project</h3>
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-green-300 mb-1">
                <span>📸</span>
                <span className="font-semibold">Photo Topic</span>
              </div>
              <p className="text-white font-medium">{currentProject.photoTopic}</p>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">{currentProject.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold text-blue-400">{currentProject.category}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                <span className="text-gray-400">Total Area</span>
                <span className="font-semibold">{currentProject.areaSqFt} m²</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Starting Price</span>
                <span className="font-semibold text-yellow-700">${currentProject.price}</span>
              </div>
            </div>

            <button className="w-full bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 text-center">
              View Project Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProject;
