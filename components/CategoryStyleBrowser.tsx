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
  /** Compact strip so it doesn't compete with the left filter panel */
  compact?: boolean;
}

type ManagedCategory = { id: string; name: string };
type ManagedStyle = { id: string; name: string; categoryName: string };

const CategoryStyleBrowser: React.FC<CategoryStyleBrowserProps> = ({
  projects,
  activeCategory,
  activeStyle,
  onCategoryChange,
  onStyleChange,
  compact = true,
}) => {
  const [managedCategories, setManagedCategories] = useState<ManagedCategory[]>([]);
  const [managedStyles, setManagedStyles] = useState<ManagedStyle[]>([]);

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

  return (
    <div className={compact ? 'mb-5' : 'border-b border-brand-line bg-white mb-6'}>
      {!compact && (
        <div className="mb-3">
          <h2 className="font-display text-2xl font-semibold text-neutral-900">
            Browse by category
          </h2>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 shrink-0">
          Quick
        </span>
        <div className="h-px flex-1 bg-brand-line" />
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => handleCategoryClick(null)}
          className={`shrink-0 px-3.5 py-1.5 text-sm font-medium transition-colors border ${
            activeCategory === null
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-700 border-brand-line hover:border-neutral-400'
          }`}
        >
          All
        </button>
        {categories.map((category) => {
          const isActive = activeCategory === category.name;
          return (
            <button
              key={category.name}
              type="button"
              onClick={() => handleCategoryClick(category.name)}
              className={`shrink-0 px-3.5 py-1.5 text-sm font-medium transition-colors border ${
                isActive
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-brand-line hover:border-neutral-400'
              }`}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-60">{category.count}</span>
            </button>
          );
        })}
      </div>

      {activeCategory && styles.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mr-1">
            Style
          </span>
          <button
            type="button"
            onClick={() => onStyleChange(null)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              activeStyle === null
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-neutral-700 hover:bg-amber-50'
            }`}
          >
            All
          </button>
          {styles.map((style) => {
            const isActive = activeStyle === style.name;
            return (
              <button
                key={style.name}
                type="button"
                onClick={() => onStyleChange(isActive ? null : style.name)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-neutral-700 hover:bg-amber-50'
                }`}
              >
                {style.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryStyleBrowser;
