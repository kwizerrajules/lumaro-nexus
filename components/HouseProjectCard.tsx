'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Shower, Buildings, Ruler, ArrowRight } from '@phosphor-icons/react';
import { formatPlanPrice, planHref } from '@/utils/brand';

interface HouseProject {
  id: string;
  slug?: string;
  title: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
  description?: string;
  category?: string;
  style?: string;
}

interface HouseProjectCardProps {
  project: HouseProject;
}

const HouseProjectCard: React.FC<HouseProjectCardProps> = ({ project }) => {
  return (
    <article className="group h-full bg-white border border-brand-line overflow-hidden transition-all duration-500 hover:shadow-brand hover:-translate-y-1">
      <Link href={planHref(project)} className="flex h-full flex-col">
        <div className="relative h-36 sm:h-44 xl:h-40 overflow-hidden bg-stone-100">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <Buildings size={32} />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-neutral-900/90 text-amber-400 px-2 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-sm">
            From {formatPlanPrice(project.price)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="font-display text-base sm:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
            {project.title}
          </h3>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-[11px] sm:text-sm text-neutral-600">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
              <Bed size={14} className="shrink-0 text-amber-700" />
              {project.bedrooms} Bed
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
              <Shower size={14} className="shrink-0 text-amber-700" />
              {project.bathrooms} Bath
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
              <Buildings size={14} className="shrink-0 text-amber-700" />
              {project.floors} Fl
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
              <Ruler size={14} className="shrink-0 text-amber-700" />
              {project.area} m²
            </span>
          </div>

          <span className="btn-primary mt-auto w-full text-xs sm:text-sm py-2 sm:py-2.5 px-3">
            View plan
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </article>
  );
};

export default HouseProjectCard;
