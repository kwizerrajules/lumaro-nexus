'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MagnifyingGlass,
  X,
  House,
  Shower,
  Buildings,
  Lightbulb,
} from '@phosphor-icons/react';
import { formatPlanPrice, matchesHouseSearch, planHref } from '@/utils/brand';

export interface SearchHouse {
  id: string;
  slug?: string;
  name: string;
  price: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  title: string;
  type: string;
  category?: string;
  style?: string;
  area: number;
  image?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: SearchHouse[];
  onHouseSelect?: (houseId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  houses,
  onHouseSelect,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHouses, setFilteredHouses] = useState<SearchHouse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
      setFilteredHouses([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHouses([]);
      setActiveIndex(0);
      return;
    }
    const filtered = houses.filter((house) =>
      matchesHouseSearch(house, searchQuery)
    );
    setFilteredHouses(filtered.slice(0, 24));
    setActiveIndex(0);
  }, [searchQuery, houses]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-search-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const goToPlan = (house: SearchHouse) => {
    onHouseSelect?.(house.id);
    onClose();
    router.push(planHref(house));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (filteredHouses.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredHouses.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const house = filteredHouses[activeIndex];
      if (house) goToPlan(house);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 pt-16 px-4 backdrop-blur-[2px] animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search house plans"
    >
      <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-brand border border-brand-line animate-fade-in-up">
        <div className="p-4 border-b border-brand-line bg-gradient-to-r from-stone-50 to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder='Try "4 bedroom", bungalow, or a plan name…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-brand pl-11"
                aria-autocomplete="list"
                aria-controls="search-results"
              />
              <MagnifyingGlass
                size={20}
                className="absolute left-3.5 top-3.5 text-amber-700"
                weight="bold"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Close search"
            >
              <X size={24} weight="bold" />
            </button>
          </div>
        </div>

        <div
          id="search-results"
          ref={listRef}
          className="max-h-96 overflow-y-auto"
          role="listbox"
        >
          {searchQuery.trim() === '' ? (
            <div className="p-10 text-center text-neutral-500">
              <MagnifyingGlass
                size={40}
                className="mx-auto text-stone-300 mb-3"
                weight="thin"
              />
              <p className="font-medium text-neutral-700">Search house plans</p>
              <p className="text-sm mt-1">
                Name, category, style, or bedroom count
              </p>
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">
              <House size={40} className="mx-auto text-stone-300 mb-3" weight="thin" />
              <p className="font-medium text-neutral-800">
                No plans match &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm mt-1">
                Try a different name, style, or &ldquo;3 bedroom&rdquo;
              </p>
            </div>
          ) : (
            <div className="divide-y divide-brand-line">
              {filteredHouses.map((house, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={house.id}
                    type="button"
                    data-search-index={index}
                    role="option"
                    aria-selected={active}
                    onClick={() => goToPlan(house)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left p-3.5 flex gap-3 transition-colors ${
                      active ? 'bg-amber-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="relative w-20 h-16 shrink-0 overflow-hidden bg-stone-100">
                      {house.image ? (
                        <Image
                          src={house.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <House size={22} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate font-display text-lg leading-tight">
                        {house.title || house.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {[house.category || house.type, house.style]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1">
                          <House size={13} /> {house.bedrooms} Bed
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Shower size={13} /> {house.bathrooms} Bath
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Buildings size={13} /> {house.floors} Fl
                        </span>
                        {house.area > 0 && (
                          <span>{house.area} m²</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className="price-brand text-sm">
                        From {formatPlanPrice(house.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 bg-stone-50 border-t border-brand-line">
          <p className="text-xs text-neutral-500 text-center inline-flex items-center justify-center gap-1.5 w-full">
            <Lightbulb size={14} weight="fill" className="text-amber-600 shrink-0" />
            ↑↓ to navigate · Enter to open · Esc to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
