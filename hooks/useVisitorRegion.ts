'use client';

import { useEffect, useState } from 'react';
import { SITE_COUNTRY } from '@/lib/seo';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Visitor country from the `visitor_country` cookie set by middleware
 * (Vercel edge geo). `ready` is false until the first client read so
 * callers can avoid flashing region-specific UI during hydration.
 */
export function useVisitorRegion() {
  const [country, setCountry] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCountry(readCookie('visitor_country').toUpperCase());
    setReady(true);
  }, []);

  return {
    country,
    ready,
    /** True only once we know the country and it is Rwanda. */
    isRwanda: ready && country === SITE_COUNTRY,
    /** True only once we know the country and it is NOT Rwanda. */
    isOutsideRwanda: ready && country !== '' && country !== SITE_COUNTRY,
  };
}
