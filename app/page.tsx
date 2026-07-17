'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Plus,
  FunnelSimple,
  Blueprint,
  FileText,
  ChatCircleDots,
} from '@phosphor-icons/react';
import AuthModal from '../components/AuthModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HouseProjectCard from '../components/HouseProjectCard';
import Sidebar from '../components/Sidebar';
import Newsletter from '../components/Newsletter';
import FeaturedProject from '../components/FeaturedProject';
import CategoryStyleBrowser from '../components/CategoryStyleBrowser';
import PlanCardSkeleton from '../components/PlanCardSkeleton';
import WatermarkedImage from '../components/WatermarkedImage';

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<any>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [filterPanelKey, setFilterPanelKey] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const { fetchHouseProjects } = await import('@/utils/productCache');
        const data = await fetchHouseProjects({ limit: 100 });

        const transform = (project: any) => ({
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
        });

        const transformedProjects = data.map(transform);
        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
        const withImage = transformedProjects.find((p: any) => p.image);
        if (withImage) setHeroImage(withImage.image);

        // Soft revalidate so admin-created plans appear without waiting for TTL
        void fetchHouseProjects({ limit: 100, force: true }).then((fresh) => {
          const next = fresh.map(transform);
          setProjects(next);
          const img = next.find((p: any) => p.image);
          if (img) setHeroImage(img.image);
        });
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

  const handleFilterChange = (newFilters: any) => {
    setSidebarFilters(newFilters);
  };

  useEffect(() => {
    let filtered = [...projects];

    if (activeCategory) {
      filtered = filtered.filter((project) => (project.category || '') === activeCategory);
    }
    if (activeStyle) {
      filtered = filtered.filter((project) => (project.style || '') === activeStyle);
    }

    const f = sidebarFilters || {};

    if (Array.isArray(f.bedrooms) && f.bedrooms.length > 0) {
      filtered = filtered.filter((project) => f.bedrooms.includes(project.bedrooms));
    }
    if (Array.isArray(f.bathrooms) && f.bathrooms.length > 0) {
      filtered = filtered.filter((project) => f.bathrooms.includes(project.bathrooms));
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
  }, [projects, sidebarFilters, activeCategory, activeStyle]);

  const clearAllFilters = () => {
    setActiveCategory(null);
    setActiveStyle(null);
    setSidebarFilters({});
    setFilterPanelKey((k) => k + 1);
  };

  const hasActiveFilters =
    !!activeCategory ||
    !!activeStyle ||
    Object.values(sidebarFilters || {}).some(
      (v: any) => Array.isArray(v) && v.length > 0
    );

  const handleAuthSuccess = (_userData: any) => {
    setShowAuthModal(false);
  };

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header onAuthSuccess={handleAuthSuccess} onContactClick={scrollToContact} />

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Brand-first hero — one composition */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-end overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          {heroImage ? (
            <WatermarkedImage
              src={heroImage}
              alt=""
              fill
              className="hero-bg-image animate-hero-reveal"
              sizes="100vw"
              priority
              mode="light"
              hideSticker
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(217,119,6,0.18),transparent_55%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-16 md:pb-24 pt-32">
          <div className="max-w-2xl">
            <p className="animate-fade-in-up text-amber-400 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-3">
              Lumaro Nexus
            </p>
            <h1 className="animate-fade-in-up-delay font-display text-2xl sm:text-3xl md:text-4xl font-medium text-white/95 leading-snug mb-4">
              House plans and construction documents for Rwanda
            </h1>
            <p className="animate-fade-in-up-delay-2 text-base md:text-lg text-neutral-300 max-w-xl leading-relaxed mb-8">
              Lumaro Nexus is a Kigali-based platform to browse ready house plans, request
              custom designs, and order architectural files prepared for District One Stop
              Centre and BPMIS accreditation. Create an account to save enquiries and manage
              your orders.
            </p>
            <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row gap-3">
              <a href="#all_house_plans" className="btn-primary">
                Browse catalog
                <ArrowRight size={18} weight="bold" />
              </a>
              <button
                type="button"
                onClick={() => router.push('/custom-plan')}
                className="btn-outline-light"
              >
                Custom design
                <Plus size={18} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* App purpose — clear for visitors and Google OAuth branding review */}
      <section
        id="about-lumaro-nexus"
        className="border-b border-brand-line bg-stone-50 py-14 md:py-16"
        aria-labelledby="purpose-heading"
      >
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-amber-800 text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            About this application
          </p>
          <h2
            id="purpose-heading"
            className="font-display text-3xl md:text-4xl font-semibold text-neutral-900 mb-4"
          >
            What Lumaro Nexus is for
          </h2>
          <p className="text-neutral-700 text-base md:text-lg leading-relaxed mb-4">
            <strong>Lumaro Nexus</strong> helps homeowners, builders, and developers in
            Rwanda find and order house plans online. You can browse our catalog, open a
            plan for full details, message us on WhatsApp to purchase a package, or start a
            custom design brief for your plot.
          </p>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
            Signing in (including with Google) lets you create and track plan enquiries,
            submit custom plan requests, and keep your project details in one place. We
            prepare construction documents with Rwanda Building Code, District One Stop
            Centre, and BPMIS requirements in mind.
          </p>
        </div>
      </section>

      {/* Process / trust — honest copy, no fake metrics */}
      <section className="border-b border-brand-line bg-white/80 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-neutral-900 mb-3">
              How we work with you
            </h2>
            <p className="text-neutral-600 text-sm md:text-base">
              From picking your plan to Professional preparation of architectural files
              that comply with District One Stop Centre and BPMIS accreditation
              requirements.
            </p>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-3 md:pb-0 -mx-4 px-4 md:mx-auto md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              {
                icon: Blueprint,
                title: '1. Choose a plan',
                text: 'Filter by bedrooms, plot size, and style — or open any plan for full specs and images.',
              },
              {
                icon: ChatCircleDots,
                title: '2. Order on WhatsApp',
                text: 'Message us to confirm the package, ask about changes for your plot, or start a custom brief.',
              },
              {
                icon: FileText,
                title: '3. Review documents',
                text: 'You get clear construction drawings prepared with the Rwanda Building Code and local permitting in mind.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="shrink-0 w-[78%] sm:w-[55%] md:w-auto md:shrink snap-center text-center md:text-left border border-brand-line md:border-0 bg-white md:bg-transparent p-5 md:p-0"
                >
                  <div className="inline-flex w-11 h-11 items-center justify-center bg-amber-700/10 text-amber-800 mb-3">
                    <Icon size={22} weight="fill" />
                  </div>
                  <h3 className="font-display font-semibold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
          <p className="md:hidden text-center text-xs text-neutral-400 mt-3">Swipe to see steps</p>
        </div>
      </section>

      <FeaturedProject />

      <div
        ref={mainContentRef}
        id="all_house_plans"
        className="container mx-auto px-4 py-10 md:py-12"
      >
        <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-3 mb-4 bg-white/95 backdrop-blur border-b border-brand-line flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">House Plans</p>
            <p className="text-xs text-neutral-500">{filteredProjects.length} results</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSidebar((o) => !o)}
            className="shrink-0 btn-secondary py-2.5 px-4 text-sm"
          >
            <FunnelSimple size={16} weight="bold" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 w-2 h-2 rounded-full bg-amber-500" aria-hidden />
            )}
          </button>
        </div>

        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowSidebar(false)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-sm h-full animate-fadeIn">
              <Sidebar
                key={`drawer-${filterPanelKey}`}
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
              key={`inline-${filterPanelKey}`}
              variant="inline"
              onFilterChange={handleFilterChange}
              resultCount={filteredProjects.length}
            />
          </div>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:block mb-6">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-neutral-900 mb-2">
                Browse all house plans
              </h2>
              <p className="text-neutral-600">
                Use filters on the left
                {hasActiveFilters ? ` · ${filteredProjects.length} matching` : ''}
              </p>
            </div>

            <CategoryStyleBrowser
              projects={projects}
              activeCategory={activeCategory}
              activeStyle={activeStyle}
              onCategoryChange={setActiveCategory}
              onStyleChange={setActiveStyle}
              compact
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mb-4 text-sm font-medium text-amber-800 hover:text-amber-950"
              >
                Clear all filters
              </button>
            )}

            {loading ? (
              <PlanCardSkeleton count={6} />
            ) : loadError ? (
              <div className="text-center py-16 border border-brand-line bg-white">
                <h3 className="font-display text-2xl font-semibold text-neutral-900 mb-2">
                  Couldn&apos;t load plans
                </h3>
                <p className="text-neutral-600 mb-6">
                  Check your connection and try again.
                </p>
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
                  No plans match
                </h3>
                <p className="text-neutral-600 mb-6">
                  Try clearing filters or browsing the full catalog.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button type="button" onClick={clearAllFilters} className="btn-secondary">
                    Clear filters
                  </button>
                  <Link href="/catalog" className="btn-primary">
                    Open catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-5 mb-16">
                {filteredProjects.map((project) => (
                  <div key={project.id} id={`house-${project.id}`}>
                    <HouseProjectCard project={project} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Newsletter />
      <Footer ref={footerRef} />
    </div>
  );
}
