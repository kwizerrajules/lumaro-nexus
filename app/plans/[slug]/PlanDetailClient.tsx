'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  WHATSAPP_DISPLAY,
  planHref,
} from '@/utils/brand';

interface PlanDetailClientProps {
  slug: string;
}

export default function PlanDetailClient({ slug }: PlanDetailClientProps) {
  const router = useRouter();
  const footerRef = useRef<HTMLElement>(null);

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

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `/api/houseprojects/${encodeURIComponent(slug)}`
        );
        if (cancelled) return;
        const p = res.data;
        setProject(p);

        // Canonicalize URL to slug when opened via legacy Mongo id
        if (p.slug && p.slug !== slug) {
          router.replace(planHref(p));
        }

        try {
          const listRes = await axios.get('/api/houseprojects', {
            params: {
              limit: 8,
              category: p.category || undefined,
            },
          });
          if (cancelled) return;
          const relatedPlans = (listRes.data?.data || [])
            .filter((item: any) => item.id !== p.id)
            .slice(0, 3)
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
          setRelated(relatedPlans);
        } catch {
          setRelated([]);
        }
      } catch {
        if (!cancelled) {
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

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnquiry = async () => {
    if (!project || !accessToken) return;
    try {
      await axios.post(
        '/api/enquiries',
        { projectId: project.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert('Added to your enquiry list');
    } catch {
      alert('Could not add to enquiry. Please sign in and try again.');
    }
  };

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header onAuthSuccess={() => {}} onContactClick={scrollToContact} />

      {loading ? (
        <div className="container mx-auto px-4 py-12">
          <div className="skeleton h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton h-80 lg:h-[480px] rounded-none" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-32 w-full" />
              <div className="skeleton h-12 w-full" />
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
            <div className="container mx-auto px-4 py-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
                Back to catalog
              </Link>
            </div>
          </div>

          <article className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 border border-brand-line mb-4">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="object-cover animate-hero-reveal"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                      <Buildings size={48} />
                    </div>
                  )}
                </div>
                <ImageCarousel projectId={project.id} />
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.category && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-100">
                      <Tag size={12} weight="fill" />
                      {project.category}
                    </span>
                  )}
                  {project.style && (
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 bg-stone-100 px-2.5 py-1">
                      {project.style}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-semibold text-neutral-900 leading-tight mb-2">
                  {project.title}
                </h1>
                <p className="text-sm text-neutral-500 mb-6">
                  {project.slug ? (
                    <>
                      <span className="text-neutral-400">/{project.slug}</span>
                    </>
                  ) : null}
                </p>

                <p className="text-3xl price-brand mb-6">
                  From {formatPlanPrice(Number(project.price))}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 border border-brand-line bg-white p-4">
                  <div className="text-center">
                    <Bed size={20} className="mx-auto text-amber-700 mb-1" />
                    <div className="font-semibold text-neutral-900">{project.bedrooms}</div>
                    <div className="text-xs text-neutral-500">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <Shower size={20} className="mx-auto text-amber-700 mb-1" />
                    <div className="font-semibold text-neutral-900">{project.bathrooms}</div>
                    <div className="text-xs text-neutral-500">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <Buildings size={20} className="mx-auto text-amber-700 mb-1" />
                    <div className="font-semibold text-neutral-900">{project.floors}</div>
                    <div className="text-xs text-neutral-500">Floors</div>
                  </div>
                  <div className="text-center">
                    <Ruler size={20} className="mx-auto text-amber-700 mb-1" />
                    <div className="font-semibold text-neutral-900">{project.areaSqFt}</div>
                    <div className="text-xs text-neutral-500">m²</div>
                  </div>
                </div>

                {project.description && (
                  <div className="mb-8">
                    <h2 className="font-display text-xl font-semibold text-neutral-900 mb-2">
                      About this plan
                    </h2>
                    <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sticky bottom-4 lg:static">
                  <a
                    href={whatsappPlanUrl({
                      title: project.title,
                      id: project.slug || project.id,
                      bedrooms: project.bedrooms,
                      bathrooms: project.bathrooms,
                      area: project.areaSqFt,
                      price: Number(project.price),
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center"
                  >
                    <WhatsappLogo size={22} weight="fill" />
                    Order on WhatsApp · {WHATSAPP_DISPLAY}
                  </a>
                  <button
                    type="button"
                    onClick={handleEnquiry}
                    disabled={!accessToken}
                    className="btn-outline-dark w-full disabled:opacity-40"
                  >
                    <Heart size={18} />
                    {accessToken ? 'Add to enquiry' : 'Sign in to add enquiry'}
                  </button>
                  <Link
                    href="/custom-plan"
                    className="text-center text-sm text-amber-800 hover:underline py-1"
                  >
                    Need changes? Request a custom plan
                  </Link>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="border-t border-brand-line pt-12">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-900 mb-6">
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
        </>
      )}

      <Footer ref={footerRef} />
    </div>
  );
}
