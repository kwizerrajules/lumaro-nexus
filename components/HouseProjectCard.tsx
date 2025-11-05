import React, { useState } from 'react';
import ModalForm from './ModalForm';

interface HouseProject {
  id: string;
  title: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
  description?: string;
}

interface HouseProjectCardProps {
  project: HouseProject;
}

const HouseProjectCard: React.FC<HouseProjectCardProps> = ({ project }) => {
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-green-100 hover:shadow-lg transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Quick Buy Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button 
                onClick={() => setShowQuickBuy(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Quick Buy
              </button>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-nude-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            From {formatPrice(project.price)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">{project.title}</h3>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-green-600 mb-3">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {project.bedrooms} Bedrooms
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {project.bathrooms} Bathrooms
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {project.floors} Floors
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {project.area} m²
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
              ID: {project.id}
            </span>
            <button 
              onClick={() => setShowQuickBuy(true)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showQuickBuy && (
        <ModalForm 
          project={project}
          onClose={() => setShowQuickBuy(false)}
        />
      )}
    </>
  );
};

export default HouseProjectCard;