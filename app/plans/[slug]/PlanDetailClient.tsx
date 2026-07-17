'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Bed,
  Shower,
  Buildings,
  Ruler,
  ArrowLeft,
  WhatsappLogo,
  Heart,
  Tag,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HouseProjectCard from '@/components/HouseProjectCard';
import ImageCarousel from '@/components/ImageCarousel';
import {
  formatPlanPrice,
  whatsappPlanUrl,
  planHref,
} from '@/utils/brand';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface PlanDetailClientProps {
  slug: string;
}

export default function PlanDetailClient({ slug }: PlanDetailClientProps) {
  const router = useRouter();
  const footerRef = useRef<HTMLElement>(null);
  const { settings } = useSiteSettings();

  const [project, setProject] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('userAccessToken');
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const mapRelated = (items: any[], currentId: string) =>
      items
        .filter((item: any) => item.id !== currentId)
        .slice(0, 4)
        .map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          price: Number(item.price),
          image: item.thumbnail,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          floors: item.floors,
          area: item.areaSqFt,
          category: item.category,
          style: item.style,
        }));

    const load = async () => {
      setError(null);

      const {
        getCachedHouseProject,
        getCachedHouseProjects,
        cacheHouseProject,
        fetchHouseProjects,
      } = await import('@/utils/productCache');

      // Instant paint from session cache (populated on home/catalog/header)
      const cached = getCachedHouseProject(slug);
      if (cached) {
        setProject(cached);
        setLoading(false);
        const cachedList = getCachedHouseProjects();
        if (cachedList.length) {
          setRelated(mapRelated(cachedList, cached.id));
        }
      } else {
        setLoading(true);
      }

      try {
        // Soft revalidate / fill missing fields (e.g. additionalImages)
        const res = await axios.get(
          `/api/houseprojects/${encodeURIComponent(slug)}`
        );
        if (cancelled) return;
        const p = res.data;
        setProject(p);
        cacheHouseProject(p);

        if (p.slug && p.slug !== slug) {
          router.replace(planHref(p));
        }

        try {
          const list = await fetchHouseProjects({
            limit: 8,
            category: p.category || undefined,
          });
          if (cancelled) return;
          setRelated(mapRelated(list, p.id));
        } catch {
          const fallback = getCachedHouseProjects();
          if (fallback.length) setRelated(mapRelated(fallback, p.id));
          else setRelated([]);
        }
      } catch {
        if (!cancelled && !cached) {
          setProject(null);
          setError('This plan could not be found or is no longer available.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  const galleryImages = useMemo(() => {
    if (!project) return [];
    return [project.thumbnail, ...(project.additionalImages || [])].filter(
      Boolean
    ) as string[];
  }, [project]);

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnquiry = async () => {
    if (!project) return;
    const token =
      accessToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('userAccessToken')
        : null);
    if (!token) {
      alert('Please sign in to add this plan to your enquiry list.');
      return;
    }
    if (!project.id) {
      alert('This plan is missing an ID. Please refresh and try again.');
      return;
    }
    try {
      await axios.post(
        '/api/enquiries',
        { projectId: project.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Added to your enquiry list');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Could not add to enquiry. Please sign in and try again.';
      alert(message);
    }
  };

  const waHref = project
    ? whatsappPlanUrl({
        title: project.title,
        id: project.slug || project.id,
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        area: project.areaSqFt,
        price: Number(project.price),
      })
    : '#';

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header onAuthSuccess={() => {}} onContactClick={scrollToContact} />

      {loading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="skeleton h-6 w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-[240px] sm:h-[300px] lg:h-[380px] rounded-none" />
            <div className="space-y-3">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-10 w-full" />
            </div>
          </div>
        </div>
      ) : error || !project ? (
        <div className="container mx-auto px-4 py-24 text-center max-w-lg">
          <h1 className="font-display text-3xl font-semibold text-neutral-900 mb-3">
            Plan not found
          </h1>
          <p className="text-neutral-600 mb-8">
            {error || 'We could not load this house plan.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="btn-primary">
              Browse catalog
            </Link>
            <Link href="/" className="btn-secondary">
              Back home
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-brand-line bg-white/70">
            <div className="container mx-auto px-4 py-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
                Back to catalog
              </Link>
            </div>
          </div>

          <article className="container mx-auto px-4 py-5 md:py-10 pb-24 lg:pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 mb-12">
              {/* Single fixed gallery */}
              <ImageCarousel
                projectId={project.id}
                initialImages={galleryImages}
                alt={project.title}
              />

              {/* Details — compact so they sit with the gallery on one screen */}
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.category && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-100">
                      <Tag size={11} weight="fill" />
                      {project.category}
                    </span>
                  )}
                  {project.style && (
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 bg-stone-100 px-2 py-0.5">
                      {project.style}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight mb-2">
                  {project.title}
                </h1>

                <p className="text-2xl sm:text-3xl price-brand mb-4">
                  From {formatPlanPrice(Number(project.price))}
                </p>

                <div className="grid grid-cols-4 gap-2 mb-4 border border-brand-line bg-white p-3">
                  <div className="text-center">
                    <Bed size={18} className="mx-auto text-amber-700 mb-0.5" />
                    <div className="font-semibold text-sm text-neutral-900">
                      {project.bedrooms}
                    </div>
                    <div className="text-[10px] text-neutral-500">Beds</div>
                  </div>
                  <div className="text-center">
                    <Shower size={18} className="mx-auto text-amber-700 mb-0.5" />
                    <div className="font-semibold text-sm text-neutral-900">
                      {project.bathrooms}
                    </div>
                    <div className="text-[10px] text-neutral-500">Baths</div>
                  </div>
                  <div className="text-center">
                    <Buildings size={18} className="mx-auto text-amber-700 mb-0.5" />
                    <div className="font-semibold text-sm text-neutral-900">
                      {project.floors}
                    </div>
                    <div className="text-[10px] text-neutral-500">Floors</div>
                  </div>
                  <div className="text-center">
                    <Ruler size={18} className="mx-auto text-amber-700 mb-0.5" />
                    <div className="font-semibold text-sm text-neutral-900">
                      {project.areaSqFt}
                    </div>
                    <div className="text-[10px] text-neutral-500">m²</div>
                  </div>
                </div>

                {project.description && (
                  <div className="mb-4">
                    <h2 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                      About this plan
                    </h2>
                    <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line line-clamp-4 lg:line-clamp-none">
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Desktop / tablet actions */}
                <div className="hidden lg:flex flex-col gap-2.5">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center text-sm py-2.5"
                  >
                    <WhatsappLogo size={18} weight="fill" />
                    Order on WhatsApp
                  </a>
                  <p className="text-center text-xs text-neutral-500">
                    {settings.phoneDisplay}
                  </p>
                  <button
                    type="button"
                    onClick={handleEnquiry}
                    disabled={!accessToken}
                    className="btn-outline-dark w-full text-sm py-2.5 disabled:opacity-40"
                  >
                    <Heart size={16} />
                    {accessToken ? 'Add to enquiry' : 'Sign in to add enquiry'}
                  </button>
                  <Link
                    href="/custom-plan"
                    className="text-center text-sm text-amber-800 hover:underline py-1"
                  >
                    Need changes? Request a custom plan
                  </Link>
                </div>

                {/* Mobile inline compact actions (plus sticky bar below) */}
                <div className="flex lg:hidden flex-col gap-2">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center text-sm py-2.5"
                  >
                    <WhatsappLogo size={18} weight="fill" />
                    Order on WhatsApp
                  </a>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleEnquiry}
                      disabled={!accessToken}
                      className="btn-outline-dark flex-1 text-xs py-2 disabled:opacity-40"
                    >
                      <Heart size={14} />
                      Enquiry
                    </button>
                    <Link
                      href="/custom-plan"
                      className="flex-1 text-center text-xs text-amber-800 hover:underline py-2"
                    >
                      Custom plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="border-t border-brand-line pt-10">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-900 mb-5">
                  Related plans
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-5">
                  {related.map((p) => (
                    <HouseProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Compact sticky WhatsApp on mobile */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-brand-line bg-white/95 backdrop-blur px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {project.title}
                </p>
                <p className="text-xs price-brand truncate">
                  From {formatPlanPrice(Number(project.price))}
                </p>
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 bg-amber-700 text-white px-3.5 py-2 rounded-md text-sm font-semibold hover:bg-amber-600"
              >
                <WhatsappLogo size={18} weight="fill" />
                Order
              </a>
            </div>
          </div>
        </>
      )}

      <Footer ref={footerRef} />
    </div>
  );
}
