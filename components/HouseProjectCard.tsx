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
  area: number; // in sqm
  description?: string;
}

interface HouseProjectCardProps {
  project: HouseProject;
}

const HouseProjectCard: React.FC<HouseProjectCardProps> = ({ project }) => {
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
        
        {/* Image */}
        <div className="relative h-56 overflow-hidden rounded-t-xl">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay with Quick View */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-500">
            <button
              onClick={() => setShowQuickBuy(true)}
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-lg transition-opacity duration-300 hover:bg-gray-50"
            >
              Quick View
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4 bg-white text-gray-900 px-3 py-2 rounded-full text-sm font-semibold shadow-md">
            From {formatPrice(project.price)}
          </div>

          {/* ID Badge */}
          <div className="absolute top-4 left-4 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
            ID: {project.id}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">{project.title}</h3>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">{project.bedrooms}</span>
              </div>
              <span className="text-gray-600 text-sm">Bedrooms</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">{project.bathrooms}</span>
              </div>
              <span className="text-gray-600 text-sm">Bathrooms</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">{project.floors}</span>
              </div>
              <span className="text-gray-600 text-sm">Floors</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">{project.area}</span>
              </div>
              <span className="text-gray-600 text-sm">m²</span>
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setShowQuickBuy(true)}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <span>View Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickBuy && <ModalForm project={project} onClose={() => setShowQuickBuy(false)} />}
    </>
  );
};

export default HouseProjectCard;
