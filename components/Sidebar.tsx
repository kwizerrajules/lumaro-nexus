'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface FilterState {
  bedrooms: number[];
  bathrooms: number[];
  floors: number[];
  priceRanges: string[];
  styles: string[];
  areas: string[];
  categories: string[];
}

interface SidebarProps {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  /** inline = always-visible left column (desktop). drawer = mobile sheet. */
  variant?: 'inline' | 'drawer';
  resultCount?: number;
}

const emptyFilters = (): FilterState => ({
  bedrooms: [],
  bathrooms: [],
  floors: [],
  priceRanges: [],
  styles: [],
  areas: [],
  categories: [],
});

const Sidebar: React.FC<SidebarProps> = ({
  onFilterChange,
  onClose,
  variant = 'inline',
  resultCount,
}) => {
  const [filters, setFilters] = useState<FilterState>(emptyFilters());
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    productType: true,
    category: true,
    bedrooms: false,
    bathrooms: false,
    area: false,
    price: false,
  });
  const [productTypes, setProductTypes] = useState<{ label: string; count: number }[]>([]);
  const [categories, setCategories] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    axios
      .get('/api/houseprojects', { params: { limit: 100 } })
      .then((res) => {
        const projects = res.data?.data || [];
        const typeMap: Record<string, number> = {};
        const categoryMap: Record<string, number> = {};

        projects.forEach((p: any) => {
          if (p.type) typeMap[p.type] = (typeMap[p.type] || 0) + 1;
          if (p.category) categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
        });

        setProductTypes(
          Object.entries(typeMap).map(([label, count]) => ({ label, count }))
        );
        setCategories(
          Object.entries(categoryMap).map(([label, count]) => ({ label, count }))
        );
      })
      .catch((err) => console.error('Failed to fetch projects:', err));
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (
    key: 'bedrooms' | 'bathrooms' | 'floors' | 'styles' | 'areas' | 'categories' | 'priceRanges',
    value: number | string
  ) => {
    const currentArray = filters[key] as (number | string)[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(filters).reduce(
    (sum, v) => sum + (Array.isArray(v) ? v.length : 0),
    0
  );

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            openSections[sectionKey] ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {openSections[sectionKey] && <div className="pb-4 space-y-2.5">{children}</div>}
    </div>
  );

  const CheckRow = ({
    checked,
    onChange,
    label,
    count,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    count?: number;
  }) => (
    <label className="flex items-center justify-between cursor-pointer group gap-2">
      <div className="flex items-center min-w-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 shrink-0 text-yellow-900 border-gray-300 rounded focus:ring-yellow-800"
        />
        <span className="ml-2.5 text-sm text-gray-700 group-hover:text-gray-900 truncate">
          {label}
        </span>
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-400 shrink-0">({count})</span>
      )}
    </label>
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeCount > 0 ? `${activeCount} active` : 'Refine results'}
            {typeof resultCount === 'number' ? ` · ${resultCount} plans` : ''}
          </p>
        </div>
        {variant === 'drawer' && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <FilterSection title="Product Type" sectionKey="productType">
          {productTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No types yet</p>
          ) : (
            productTypes.map((type) => (
              <CheckRow
                key={type.label}
                checked={filters.styles.includes(type.label)}
                onChange={() => toggleArrayFilter('styles', type.label)}
                label={type.label}
                count={type.count}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Category" sectionKey="category">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories yet</p>
          ) : (
            categories.map((category) => (
              <CheckRow
                key={category.label}
                checked={filters.categories.includes(category.label)}
                onChange={() => toggleArrayFilter('categories', category.label)}
                label={category.label}
                count={category.count}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Bedrooms" sectionKey="bedrooms">
          {[1, 2, 3, 4, 5].map((count) => (
            <CheckRow
              key={count}
              checked={filters.bedrooms.includes(count)}
              onChange={() => toggleArrayFilter('bedrooms', count)}
              label={count === 5 ? '5+ Bedrooms' : `${count} Bedroom${count > 1 ? 's' : ''}`}
            />
          ))}
        </FilterSection>

        <FilterSection title="Bathrooms" sectionKey="bathrooms">
          {[1, 2, 3, 4, 5].map((count) => (
            <CheckRow
              key={count}
              checked={filters.bathrooms.includes(count)}
              onChange={() => toggleArrayFilter('bathrooms', count)}
              label={count === 5 ? '5+ Bathrooms' : `${count} Bathroom${count > 1 ? 's' : ''}`}
            />
          ))}
        </FilterSection>

        <FilterSection title="Area" sectionKey="area">
          {[
            { label: 'Small (0–50 m²)', value: '0-50' },
            { label: 'Medium (51–100 m²)', value: '51-100' },
            { label: 'Large (101–200 m²)', value: '101-200' },
            { label: 'Extra Large (200+ m²)', value: '201-null' },
          ].map((area) => (
            <CheckRow
              key={area.value}
              checked={filters.areas.includes(area.value)}
              onChange={() => toggleArrayFilter('areas', area.value)}
              label={area.label}
            />
          ))}
        </FilterSection>

        <FilterSection title="Price" sectionKey="price">
          {[
            { label: '0 – 50,000', value: '0-50000' },
            { label: '50,001 – 100,000', value: '50001-100000' },
            { label: '100,001 – 500,000', value: '100001-500000' },
            { label: '500,001+', value: '500001-null' },
          ].map((priceRange) => (
            <CheckRow
              key={priceRange.value}
              checked={filters.priceRanges.includes(priceRange.value)}
              onChange={() => toggleArrayFilter('priceRanges', priceRange.value)}
              label={priceRange.label}
            />
          ))}
        </FilterSection>

        <div className="pt-4 space-y-3">
          <Link
            href="/custom-plan"
            className="block w-full text-center bg-yellow-900 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-yellow-800 transition-colors"
            onClick={onClose}
          >
            Custom Plan
          </Link>
          <button
            type="button"
            onClick={() => {
              const reset = emptyFilters();
              setFilters(reset);
              onFilterChange(reset);
            }}
            className="w-full border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
          {variant === 'drawer' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-gray-800"
            >
              Show results{typeof resultCount === 'number' ? ` (${resultCount})` : ''}
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (variant === 'drawer') {
    return (
      <aside className="w-full max-w-sm bg-white h-full max-h-[100dvh] overflow-y-auto shadow-2xl">
        {content}
      </aside>
    );
  }

  return (
    <aside className="w-full bg-white rounded-xl border border-gray-200 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {content}
    </aside>
  );
};

export default Sidebar;
