'use client';
import React, { useState, useEffect, useRef } from 'react';

interface House {
  id: string;
  name: string;
  price: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
  onHouseSelect: (houseId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  houses, 
  onHouseSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHouses([]);
    } else {
      const filtered = houses.filter(house =>
        house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.id.toString().includes(searchQuery) ||
        house.bedrooms.toString().includes(searchQuery) ||
        house.bathrooms.toString().includes(searchQuery)
      );
      setFilteredHouses(filtered);
    }
  }, [searchQuery, houses]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleHouseClick = (houseId: string) => {
    // Call the onHouseSelect prop instead of handling navigation here
    onHouseSelect(houseId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search house plans by name, ID, bedrooms, bathrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg 
                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Enter search terms to find house plans</p>
              <p className="text-sm mt-1">Search by name, ID, number of bedrooms, or bathrooms</p>
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No house plans found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try different search terms</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredHouses.map((house) => (
                <div
                  key={house.id}
                  onClick={() => handleHouseClick(house.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{house.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">ID: {house.id}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>🏠 {house.bedrooms} Bed</span>
                        <span>🚿 {house.bathrooms} Bath</span>
                        <span>🏢 {house.floors} Floor{house.floors > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">From ${house.price}</p>
                      <p className="text-xs text-gray-500 mt-1">{house.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Tips */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Try searching by: house name, plan ID, number of bedrooms (e.g., "4 bedroom"), or bathrooms
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;