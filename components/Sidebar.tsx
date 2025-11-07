import React, { useState } from 'react';

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
    styles: [],
  });

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
    <aside className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto p-6 space-y-10">
      {/* 🔹 Filters Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Filters</h2>
        <div className="w-10 h-1 bg-sky-600 rounded"></div>
      </div>

      {/* 🔹 Sort Options */}
      <div>
        <h3 className="uppercase text-sm font-semibold text-gray-800 mb-3 tracking-wide">
          Sort by
        </h3>
        <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition">
          <option>Alphabetically, A-Z</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest First</option>
          <option>Most Popular</option>
        </select>
      </div>

      {/* 🔹 Product Type */}
      <div>
        <h3 className="uppercase text-sm font-semibold text-gray-800 mb-3 tracking-wide">
          Product Type
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Apartments', count: 20 },
            { label: 'Houses', count: 15 },
            { label: 'Studios', count: 8 },
            { label: 'Commercial', count: 5 },
          ].map((type) => (
            <label key={type.label} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.styles.includes(type.label)}
                  onChange={() => toggleArrayFilter('styles', type.label)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-600 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-sky-600 transition-colors">
                  {type.label}
                </span>
              </div>
              <span className="text-gray-400 text-sm">({type.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🔹 Bedrooms */}
      <div>
        <h3 className="uppercase text-sm font-semibold text-gray-800 mb-3 tracking-wide">
          Number of Bedrooms
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((count) => (
            <label key={count} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bedrooms.includes(count)}
                  onChange={() => toggleArrayFilter('bedrooms', count)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-600 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-sky-600 transition-colors">
                  {count} {count === 5 ? '+ Bedrooms' : 'Bedroom' + (count > 1 ? 's' : '')}
                </span>
              </div>
              <span className="text-gray-400 text-sm">(0)</span> {/* 👋 dynamic count from DB */}
            </label>
          ))}
        </div>
      </div>

      {/* 🔹 Bathrooms */}
      <div>
        <h3 className="uppercase text-sm font-semibold text-gray-800 mb-3 tracking-wide">
          Number of Bathrooms
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((count) => (
            <label key={count} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bathrooms.includes(count)}
                  onChange={() => toggleArrayFilter('bathrooms', count)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-600 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-sky-600 transition-colors">
                  {count} {count === 5 ? '+ Bathrooms' : 'Bathroom' + (count > 1 ? 's' : '')}
                </span>
              </div>
              <span className="text-gray-400 text-sm">(0)</span> {/* 👋 dynamic count from DB */}
            </label>
          ))}
        </div>
      </div>

      {/* 🔹 Custom Plan CTA */}
      <div>
        <h3 className="uppercase text-sm font-semibold text-gray-800 mb-3 tracking-wide">
          Custom Plan
        </h3>
        <button className="w-full bg-sky-600 hover:bg-sky-700 text-white py-4 px-6 rounded-lg font-semibold transition">
          Customize Your Own House Plan Now!
        </button>
      </div>

      {/* 🔹 Reset Filters */}
      <button
        onClick={() => {
          const resetFilters = {
            bedrooms: [],
            bathrooms: [],
            floors: [],
            minPrice: 0,
            maxPrice: 5000,
            styles: [],
          };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
        className="w-full border-2 border-gray-300 hover:border-sky-500 hover:bg-sky-50 text-gray-800 py-3 px-6 rounded-lg font-semibold transition"
      >
        Reset All Filters
      </button>

      {/* 👋 Endpoint: connect to /api/houses or /api/projects to apply filters */}
    </aside>
  );
};

export default Sidebar;
