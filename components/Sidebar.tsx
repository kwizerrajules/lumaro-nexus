import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface FilterState {
  bedrooms: number[];
  bathrooms: number[];
  floors: number[];
  // minPrice: number;
  priceRanges: string[];
  // maxPrice: number;
  styles: string[];
  areas: string[];
  categories: string[]
}

interface SidebarProps {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange, onClose }) => {
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: [],
    bathrooms: [],
    floors: [],
    // minPrice: 0,
    // maxPrice: 1000000,
    priceRanges: [],
    styles: [],
    areas: [],
    categories: [],
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<{ label: string, count: number }[]>([]);
  const [categories, setCategories] = useState<{ label: string, count: number }[]>([]);

useEffect(() => {
  axios.get("/api/houseprojects")
    .then((res) => {
      const projects = res.data?.data || [];
      const typeMap: Record<string, number> = {};

      projects.forEach(p => {
        if (p.type) {
          typeMap[p.type] = (typeMap[p.type] || 0) + 1;
        }
      });

      const categoryMap: Record<string, number> = {};
      projects.forEach(p => {
        if (p.categoty) { 
          categoryMap[p.categoty] = (categoryMap[p.categoty] || 0) + 1;
        }
      });
      const categoriesArray = Object.entries(categoryMap).map(([label, count]) => ({ label, count }));
      const typesArray = Object.entries(typeMap).map(([label, count]) => ({ label, count }));
      setProductTypes(typesArray);
      setCategories(categoriesArray)
    })
    .catch(err => console.error("Failed to fetch projects:", err));
}, []);



  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'bedrooms' | 'bathrooms' | 'floors' | 'styles' | 'areas' | 'categories' | 'priceRanges' , value: number | string) => {
    const currentArray = filters[key] as (number | string)[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  // Close tab when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeTab && !(event.target as Element).closest('.filter-tab')) {
        setActiveTab(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeTab]);

  const FilterTab: React.FC<{
    title: string;
    tabKey: string;
    children: React.ReactNode;
  }> = ({ title, tabKey, children }) => (
    <div className="relative filter-tab">
      <button
        onClick={() => setActiveTab(activeTab === tabKey ? null : tabKey)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
          activeTab === tabKey 
            ? 'bg-gray-900 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span>{title}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${
            activeTab === tabKey ? 'rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content */}
      {activeTab === tabKey && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-96 bg-white rounded-l-2xl shadow-2xl border-l border-gray-200 h-auto max-h-[80vh] overflow-y-auto">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Filters</h2>
          <div className="h-1 w-12 bg-gray-900"></div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        {/* Tab-based Filters */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Filter By</h3>
          <div className="flex flex-wrap gap-3">
            {/* Product Type Tab */}
           <FilterTab title="Product Type" tabKey="productType">
  <h4 className="font-semibold text-gray-900 mb-4">Product Type</h4>
  <div className="space-y-3">
    {productTypes.map((type) => (
      <label key={type.label} className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.styles.includes(type.label)}
            onChange={() => toggleArrayFilter('styles', type.label)}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
          />
          <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">{type.label}</span>
        </div>
        <span className="text-gray-400 text-sm">({type.count})</span>
      </label>
    ))}
  </div>
</FilterTab>


            {/* Categories Tab */}
            <FilterTab title="Category" tabKey="category">
  <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
  <div className="space-y-3">
    {categories.map(category => (
      <label key={category.label} className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.categories.includes(category.label)}
            onChange={() => toggleArrayFilter('categories', category.label)}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
          />
          <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">{category.label}</span>
        </div>
        <span className="text-gray-400 text-sm">({category.count})</span>
      </label>
    ))}
  </div>
</FilterTab>


            {/* Bedrooms Tab */}
            <FilterTab title="Bedrooms" tabKey="bedrooms">
              <h4 className="font-semibold text-gray-900 mb-4">Number of Bedrooms</h4>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(count => (
                  <label key={count} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.bedrooms.includes(count)}
                        onChange={() => toggleArrayFilter('bedrooms', count)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                        {count} {count === 5 ? '+ Bedrooms' : 'Bedroom' + (count > 1 ? 's' : '')}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">(0)</span>
                  </label>
                ))}
              </div>
            </FilterTab>

            {/* Bathrooms Tab */}
            <FilterTab title="Bathrooms" tabKey="bathrooms">
              <h4 className="font-semibold text-gray-900 mb-4">Number of Bathrooms</h4>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(count => (
                  <label key={count} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.bathrooms.includes(count)}
                        onChange={() => toggleArrayFilter('bathrooms', count)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                        {count} {count === 5 ? '+ Bathrooms' : 'Bathroom' + (count > 1 ? 's' : '')}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">(0)</span>
                  </label>
                ))}
              </div>
            </FilterTab>

            {/* Area Tab */}
                <FilterTab title="Area" tabKey="area">
  <h4 className="font-semibold text-gray-900 mb-4">Area Range (m²)</h4>
  <div className="space-y-3">
    {[
      { label: "Small (0–50 m²)", value: "0-50" },
      { label: "Medium (51–100 m²)", value: "51-100" },
      { label: "Large (101–200 m²)", value: "101-200" },
      { label: "Extra Large (200+ m²)", value: "201-null" }
    ].map((area) => (
      <label key={area.value} className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.areas.includes(area.value)}
            onChange={() => toggleArrayFilter("areas", area.value)}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
          />
          <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
            {area.label}
          </span>
        </div>
        <span className="text-gray-400 text-sm">(0)</span>
      </label>
    ))}
  </div>
</FilterTab>



            {/* Price Tab */}
<FilterTab title="Price" tabKey="price">
  <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
  <div className="space-y-3">
    {[
      { label: '0 - 50,000', value: '0-50000' },
      { label: '50,001 - 100,000', value: '50001-100000' },
      { label: '100,001 - 500,000', value: '100001-500000' },
      { label: '500,001+', value: '500001-null' }
    ].map((priceRange) => (
      <label key={priceRange.value} className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.priceRanges?.includes(priceRange.value)}
            onChange={() => toggleArrayFilter('priceRanges', priceRange.value)}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
          />
          <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">{priceRange.label}</span>
        </div>
      </label>
    ))}
  </div>
</FilterTab>




          </div>
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Sort by</h3>
          <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors">
            <option>Alphabetically, A-Z</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
            <option>Most Popular</option>
          </select>
        </div>

        {/* Custom Plan CTA */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Custom Plan</h3>
          <button className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 text-center">
            Customize Your Own House Plan Now!
          </button>
        </div>

        {/* Reset Filters */}
        <button 
          onClick={() => {
            const resetFilters = {
              bedrooms: [],
              bathrooms: [],
              floors: [],
              priceRanges: [],
              styles: [],
              areas: [],
              categories: [],
              tags: []
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
            setActiveTab(null);
          }}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors duration-300"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar;