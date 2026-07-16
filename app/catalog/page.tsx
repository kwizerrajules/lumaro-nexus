'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HouseProjectCard from '@/components/HouseProjectCard';
import Sidebar from '@/components/Sidebar';
import Newsletter from '@/components/Newsletter';
import PlanCardSkeleton from '@/components/PlanCardSkeleton';
import { FunnelSimple } from '@phosphor-icons/react';
import axios from 'axios';

export default function Catalog() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<any>({});
  const [filterPanelKey, setFilterPanelKey] = useState(0);
  const footerRef = useRef<HTMLElement>(null);

  const handleAuthSuccess = (_userData: any) => {};

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const result = await axios.get('/api/houseprojects', {
          params: { limit: 100 },
        });

        if (result.data?.data) {
          const transformed = result.data.data.map((project: any) => ({
            id: project.id,
            slug: project.slug,
            title: project.title,
            price: parseFloat(project.price),
            image: project.thumbnail,
            bedrooms: project.bedrooms,
            bathrooms: project.bathrooms,
            floors: project.floors,
            area: project.areaSqFt,
            description: project.description,
            location: project.location,
            style: project.style,
            type: project.type,
            category: project.category,
            rooms: project.rooms,
            status: project.status,
          }));
          setProjects(transformed);
          setFilteredProjects(transformed);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        setFilteredProjects([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];
    const f = sidebarFilters || {};

    if (Array.isArray(f.bedrooms) && f.bedrooms.length > 0) {
      filtered = filtered.filter((project) => f.bedrooms.includes(project.bedrooms));
    }
    if (Array.isArray(f.bathrooms) && f.bathrooms.length > 0) {
      filtered = filtered.filter((project) => f.bathrooms.includes(project.bathrooms));
    }
    if (Array.isArray(f.floors) && f.floors.length > 0) {
      filtered = filtered.filter((project) => f.floors.includes(project.floors));
    }
    if (Array.isArray(f.areas) && f.areas.length > 0) {
      filtered = filtered.filter((project) =>
        f.areas.some((rangeStr: string) => {
          const [minStr, maxStr] = rangeStr.split('-');
          const min = Number(minStr);
          const max = maxStr === 'null' ? null : Number(maxStr);
          if (max === null) return project.area >= min;
          return project.area >= min && project.area <= max;
        })
      );
    }
    if (Array.isArray(f.priceRanges) && f.priceRanges.length > 0) {
      filtered = filtered.filter((project) =>
        f.priceRanges.some((rangeStr: string) => {
          const [minStr, maxStr] = rangeStr.split('-');
          const min = Number(minStr);
          const max = maxStr === 'null' ? null : Number(maxStr);
          if (max === null) return project.price >= min;
          return project.price >= min && project.price <= max;
        })
      );
    }
    if (Array.isArray(f.styles) && f.styles.length > 0) {
      filtered = filtered.filter((project) =>
        f.styles.includes(project.type || 'Unknown')
      );
    }
    if (Array.isArray(f.categories) && f.categories.length > 0) {
      filtered = filtered.filter(
        (project) => project.category && f.categories.includes(project.category)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, sidebarFilters]);

  const handleFilterChange = (newFilters: any) => {
    setSidebarFilters(newFilters);
  };

  const hasActiveFilters = Object.values(sidebarFilters || {}).some(
    (v: any) => Array.isArray(v) && v.length > 0
  );

  const clearAllFilters = () => {
    setSidebarFilters({});
    setFilterPanelKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header
        onAuthSuccess={handleAuthSuccess}
        onContactClick={scrollToContact}
      />

      <section className="relative min-h-[38vh] sm:min-h-[42vh] flex items-end overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/image/features-template.jpg"
            alt=""
            fill
            className="object-cover object-[center_40%] md:object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(217,119,6,0.18),transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-14 pt-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Catalog
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Browse our house plans
            </h1>
            <p className="text-base md:text-lg text-neutral-300 max-w-xl mx-auto">
              Filter by size, bedrooms, and type — then open any plan for full details
              and WhatsApp ordering.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-3 mb-4 bg-white/95 backdrop-blur border-b border-brand-line flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Catalog</p>
            <p className="text-xs text-neutral-500">{filteredProjects.length} results</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="btn-secondary py-2.5 px-4 text-sm"
          >
            <FunnelSimple size={16} weight="bold" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden />
            )}
          </button>
        </div>

        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowSidebar(false)}
            />
            <div className="relative z-10 w-full max-w-sm h-full">
              <Sidebar
                key={`cat-drawer-${filterPanelKey}`}
                variant="drawer"
                onFilterChange={handleFilterChange}
                onClose={() => setShowSidebar(false)}
                resultCount={filteredProjects.length}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <Sidebar
              key={`cat-inline-${filterPanelKey}`}
              variant="inline"
              onFilterChange={handleFilterChange}
              resultCount={filteredProjects.length}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex justify-between items-end mb-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-neutral-900">
                  All house plans
                </h2>
                <p className="text-neutral-600 mt-1">
                  {filteredProjects.length} plan{filteredProjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-amber-800 hover:text-amber-950"
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <PlanCardSkeleton count={9} />
            ) : loadError ? (
              <div className="text-center py-16 border border-brand-line bg-white">
                <h3 className="font-display text-2xl font-semibold text-neutral-900 mb-2">
                  Couldn&apos;t load catalog
                </h3>
                <p className="text-neutral-600 mb-6">Please try again shortly.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Retry
                </button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16 border border-brand-line bg-white">
                <h3 className="font-display text-2xl font-semibold text-neutral-900 mb-2">
                  No plans found
                </h3>
                <p className="text-neutral-600 mb-6">Try adjusting your filters</p>
                <button type="button" onClick={clearAllFilters} className="btn-secondary">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-5 mb-16">
                {filteredProjects.map((project) => (
                  <HouseProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer ref={footerRef} />
    </div>
  );
}
