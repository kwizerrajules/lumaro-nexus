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
  photoTopic: string; // 👈 Admin-named photo topic
  category: string; // 👈 Admin-defined category
  tags: string[]; // 👈 Admin-added tags
}

const FeaturedProject: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<FeaturedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        // 👇 Hand emoji - Replace with your actual API endpoint
        const response = await fetch('/api/houseprojects');
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setCurrentProject(data.data[0]); // Show first featured project
        } else {
          // Fallback data with admin-named topics
          setCurrentProject({
            id: '49801',
            title: 'Luxury 2 Bedroom Apartments',
            description: 'Premium apartment complex with modern amenities and stunning architectural design. Perfect for urban living with spacious layouts and contemporary finishes.',
            thumbnail: 'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_960_720.jpg',
            price: 985,
            bedrooms: 2,
            bathrooms: 2,
            areaSqFt: 85,
            featuredText: '🏆 Project of the Month',
            photoTopic: 'Modern Urban Living', // 👈 Admin-named topic
            category: 'Apartment Complex', // 👈 Admin-defined category
            tags: ['Modern', 'Luxury', 'Urban', 'Sustainable'] // 👈 Admin-added tags
          });
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        // Fallback data with admin-named topics
        setCurrentProject({
          id: '49801',
          title: 'Luxury 2 Bedroom Apartments',
          description: 'Premium apartment complex with modern amenities and stunning architectural design. Perfect for urban living with spacious layouts and contemporary finishes.',
          thumbnail: 'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_960_720.jpg',
          // image: '/featured-house.jpg',
          price: 985,
          bedrooms: 2,
          bathrooms: 2,
          areaSqFt: 85,
          featuredText: '🏆 Project of the Month',
          photoTopic: 'Modern Urban Living', // 👈 Admin-named topic
          category: 'Apartment Complex', // 👈 Admin-defined category
          tags: ['Modern', 'Luxury', 'Urban', 'Sustainable'] // 👈 Admin-added tags
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();

    // Rotate featured projects every 30 seconds
    const interval = setInterval(fetchFeaturedProjects, 30000);
    return () => clearInterval(interval);
  }, []);

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

  if (!currentProject) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Project Image (3/4 width) */}
          <div className="lg:w-3/4 relative">
            <div 
              className="h-96 lg:h-[500px] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${currentProject.thumbnail})` }}
            >
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
              
              {/* Featured Badge */}
              <div className="absolute top-6 left-6 bg-yellow-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Discover Our Latest Innovations
              </div>

              {/* Admin-Named Photo Topic */}
              <div className="absolute top-6 right-6 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                📸 {currentProject.photoTopic}
              </div>

              {/* Project Info Overlay */}
              <div className="absolute bottom-6 left-6">
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">{currentProject.title}</h2>
                
                {/* Admin-defined Category */}
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

          {/* Right - Description (1/4 width) */}
          <div className="lg:w-1/4 bg-gray-800 p-8 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4 text-yellow-700">Featured Project</h3>
              
              {/* Admin Photo Topic Display */}
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-green-300 mb-1">
                  <span>📸</span>
                  <span className="font-semibold">Photo Topic</span>
                </div>
                <p className="text-white font-medium">{currentProject.photoTopic}</p>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                {currentProject.description}
              </p>
              
              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                {/* <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <span className="text-gray-400">Project ID</span>
                  <span className="font-semibold">{currentProject.id}</span>
                </div> */}
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

              {/* Admin Tags */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                  <span>🏷️</span>
                  <span>Project Tags</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 text-center">
                View Project Details
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProject;