'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface BrowserProject {
  category?: string | null;
  style?: string | null;
}

interface CategoryStyleBrowserProps {
  projects: BrowserProject[];
  activeCategory: string | null;
  activeStyle: string | null;
  onCategoryChange: (category: string | null) => void;
  onStyleChange: (style: string | null) => void;
}

type ManagedCategory = { id: string; name: string };
type ManagedStyle = { id: string; name: string; categoryName: string };

const CategoryStyleBrowser: React.FC<CategoryStyleBrowserProps> = ({
  projects,
  activeCategory,
  activeStyle,
  onCategoryChange,
  onStyleChange,
}) => {
  const [managedCategories, setManagedCategories] = useState<ManagedCategory[]>([]);
  const [managedStyles, setManagedStyles] = useState<ManagedStyle[]>([]);

  // Load the admin-defined categories and styles (the canonical taxonomy).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [catRes, styleRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/styles'),
        ]);
        if (cancelled) return;
        setManagedCategories(catRes.data?.data || []);
        setManagedStyles(styleRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load categories/styles:', err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCount = (name: string) =>
    projects.filter((p) => (p.category || '') === name).length;

  // Prefer the admin taxonomy; fall back to names found on projects so the bar
  // still works before any categories are configured. Only surface categories
  // that actually have houses, so visitors never hit an empty result.
  const categories = useMemo(() => {
    const names = new Set<string>();
    managedCategories.forEach((c) => names.add(c.name));
    if (names.size === 0) {
      projects.forEach((p) => {
        if (p.category) names.add(p.category);
      });
    }
    return Array.from(names)
      .map((name) => ({ name, count: categoryCount(name) }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managedCategories, projects]);

  const styles = useMemo(() => {
    if (!activeCategory) return [];
    const styleCount = (name: string) =>
      projects.filter(
        (p) => (p.style || '') === name && (p.category || '') === activeCategory
      ).length;

    const names = new Set<string>();
    managedStyles
      .filter((s) => s.categoryName === activeCategory)
      .forEach((s) => names.add(s.name));
    if (names.size === 0) {
      projects
        .filter((p) => (p.category || '') === activeCategory && p.style)
        .forEach((p) => names.add(p.style as string));
    }
    return Array.from(names)
      .map((name) => ({ name, count: styleCount(name) }))
      .filter((s) => s.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managedStyles, projects, activeCategory]);

  const handleCategoryClick = (name: string | null) => {
    onStyleChange(null);
    onCategoryChange(name);
  };

  if (categories.length === 0) return null;

  const totalCount = projects.length;

  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-sm text-gray-500">
              Find your perfect plan by category and style
            </p>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeCategory === null
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Plans
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeCategory === null
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-gray-500'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {categories.map((category) => {
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                  }`}
                >
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Style pills for the active category */}
        {activeCategory && styles.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-4">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Styles
            </span>
            <button
              onClick={() => onStyleChange(null)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeStyle === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              All {activeCategory}
            </button>
            {styles.map((style) => {
              const isActive = activeStyle === style.name;
              return (
                <button
                  key={style.name}
                  onClick={() => onStyleChange(isActive ? null : style.name)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {style.name}
                  <span className="ml-1.5 text-xs opacity-70">({style.count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryStyleBrowser;
