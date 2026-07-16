'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bed,
  Shower,
  Ruler,
  CaretLeft,
  CaretRight,
  ArrowRight,
} from '@phosphor-icons/react';
import { formatPlanPrice, planHref } from '@/utils/brand';

interface FeaturedProject {
  id: string;
  slug?: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  category: string;
  style?: string;
}

const FeaturedProject: React.FC = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { fetchHouseProjects } = await import('@/utils/productCache');
        const data = await fetchHouseProjects({ limit: 20 });
        setProjects((data || []).slice(0, 4) as FeaturedProject[]);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  useEffect(() => {
    if (projects.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [projects]);

  if (loading) {
    return (
      <section className="w-full border-y border-brand-line bg-neutral-900">
        <div className="h-[380px] skeleton rounded-none bg-neutral-800" />
      </section>
    );
  }

  if (!projects.length) return null;

  const current = projects[currentIndex];

  return (
    <section className="w-full bg-neutral-950 text-white border-y border-neutral-800">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Featured plans
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">
              Selected from the catalog
            </h2>
          </div>
          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous featured plan"
                onClick={() =>
                  setCurrentIndex((i) => (i - 1 + projects.length) % projects.length)
                }
                className="p-2 border border-white/20 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                type="button"
                aria-label="Next featured plan"
                onClick={() => setCurrentIndex((i) => (i + 1) % projects.length)}
                className="p-2 border border-white/20 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:min-h-[380px] border border-white/10 overflow-hidden">
          <div className="relative lg:col-span-8 h-64 lg:h-auto min-h-[280px]">
            {current.thumbnail ? (
              <Image
                key={current.id}
                src={current.thumbnail}
                alt={current.title}
                fill
                className="object-cover animate-hero-reveal"
                sizes="(max-width: 1024px) 100vw, 66vw"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <Bed size={14} /> {current.bedrooms} Bed
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <Shower size={14} /> {current.bathrooms} Bath
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <Ruler size={14} /> {current.areaSqFt} m²
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-neutral-900 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">
              {[current.category, current.style].filter(Boolean).join(' · ') || 'House plan'}
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3 leading-tight">
              {current.title}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5 line-clamp-4">
              {current.description ||
                'A carefully documented plan ready for review with your builder.'}
            </p>
            <p className="text-amber-400 text-xl font-semibold mb-6">
              From {formatPlanPrice(current.price)}
            </p>
            <Link href={planHref(current)} className="btn-primary w-full justify-center">
              View this plan
              <ArrowRight size={16} weight="bold" />
            </Link>

            {projects.length > 1 && (
              <div className="flex gap-1.5 mt-6 justify-center">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Show featured plan ${i + 1}`}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-8 bg-amber-500'
                        : 'w-1.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProject;
