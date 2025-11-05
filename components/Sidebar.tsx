import React, { useState, useEffect } from 'react';

interface FilterState {
  bedrooms: number[];
  bathrooms: number[];
  floors: number[];
  minPrice: number;
  maxPrice: number;
  styles: string[];
}

interface SidebarProps {
  onFilterChange: (filters: FilterState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: [],
    bathrooms: [],
    floors: [],
    minPrice: 0,
    maxPrice: 5000,
    styles: []
  });

  const [bedroomCounts, setBedroomCounts] = useState<{count: number, total: number}[]>([]);
  const [bathroomCounts, setBathroomCounts] = useState<{count: number, total: number}[]>([]);

  // 🤚 GET endpoint to fetch filter counts
  useEffect(() => {
    const fetchFilterCounts = async () => {
      try {
        // 🤚 Replace with: GET /api/filters/counts
        const response = await fetch('/api/filters/counts');
        const data = await response.json();
        setBedroomCounts(data.bedrooms);
        setBathroomCounts(data.bathrooms);
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      }
    };
    fetchFilterCounts();
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'bedrooms' | 'bathrooms' | 'floors' | 'styles', value: number | string) => {
    const currentArray = filters[key] as (number | string)[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  return (
    <div className="w-64 bg-white p-6 border-r border-green-100 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold text-green-800 mb-6">Filters</h2>

      {/* Product Type */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Product Type</h3>
        <div className="space-y-2">
          {['House', 'Apartment', 'Studio', 'Commercial'].map(type => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.styles.includes(type)}
                onChange={() => toggleArrayFilter('styles', type)}
                className="text-green-500 focus:ring-green-500"
              />
              <span className="ml-2 text-green-600">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Bedrooms */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Number of Bedrooms</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(count => (
            <label key={count} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bedrooms.includes(count)}
                  onChange={() => toggleArrayFilter('bedrooms', count)}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-green-600">
                  {count} {count === 5 ? '+ Bedrooms' : 'Bedroom' + (count > 1 ? 's' : '')}
                </span>
              </div>
              <span className="text-green-400 text-sm">
                ({bedroomCounts.find(b => b.count === count)?.total || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Bathrooms */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Number of Bathrooms</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(count => (
            <label key={count} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bathrooms.includes(count)}
                  onChange={() => toggleArrayFilter('bathrooms', count)}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-green-600">
                  {count} {count === 5 ? '+ Bathrooms' : 'Bathroom' + (count > 1 ? 's' : '')}
                </span>
              </div>
              <span className="text-green-400 text-sm">
                ({bathroomCounts.find(b => b.count === count)?.total || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Floors */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Number of Floors</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(count => (
            <label key={count} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.floors.includes(count)}
                onChange={() => toggleArrayFilter('floors', count)}
                className="text-green-500 focus:ring-green-500"
              />
              <span className="ml-2 text-green-600">
                {count} {count === 1 ? 'Floor' : 'Floors'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-green-600 mb-2">Min: ${filters.minPrice}</label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-green-600 mb-2">Max: ${filters.maxPrice}</label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>
        </div>
      </div>

      {/* Custom My Plan */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-700 mb-3">Custom My Plan</h3>
        <button className="w-full bg-nude-500 text-white py-2 px-4 rounded-lg hover:bg-nude-600 transition-colors font-medium">
          Start Custom Design
        </button>
      </div>

      {/* Reset Filters */}
      <button 
        onClick={() => {
          const resetFilters = {
            bedrooms: [],
            bathrooms: [],
            floors: [],
            minPrice: 0,
            maxPrice: 5000,
            styles: []
          };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
        className="w-full border border-green-500 text-green-500 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default Sidebar;