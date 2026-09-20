import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_EAC_RATES,
  formatCurrency,
  type EacCurrencyCode,
} from '@/utils/currency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIMARY_RATE_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const FALLBACK_RATE_URL =
  'https://latest.currency-api.pages.dev/v1/currencies/usd.json';

interface CachedRates {
  rates: Record<string, number>;
  date: string;
  fetchedAt: number;
}

let memoryCache: CachedRates | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchLiveRates(): Promise<{
  rates: Record<string, number>;
  date: string;
}> {
  if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return { rates: memoryCache.rates, date: memoryCache.date };
  }

  const endpoints = [PRIMARY_RATE_URL, FALLBACK_RATE_URL];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      clearTimeout(timer);

      if (!res.ok) continue;

      const data = await res.json();
      const usdMap = data?.usd || {};

      const rates: Record<string, number> = {
        USD: 1,
        RWF: Number(usdMap.rwf) || DEFAULT_EAC_RATES.RWF,
        KES: Number(usdMap.kes) || DEFAULT_EAC_RATES.KES,
        UGX: Number(usdMap.ugx) || DEFAULT_EAC_RATES.UGX,
        TZS: Number(usdMap.tzs) || DEFAULT_EAC_RATES.TZS,
        BIF: Number(usdMap.bif) || DEFAULT_EAC_RATES.BIF,
        EUR: Number(usdMap.eur) || 0.87,
        GBP: Number(usdMap.gbp) || 0.75,
      };

      const date = data?.date || new Date().toISOString().split('T')[0];

      memoryCache = {
        rates,
        date,
        fetchedAt: Date.now(),
      };

      return { rates, date };
    } catch (err) {
      console.warn(`[currency API] failed to fetch from ${url}:`, err);
    }
  }

  // If both endpoints failed, return existing cache or fallback
  if (memoryCache) {
    return { rates: memoryCache.rates, date: memoryCache.date };
  }

  return {
    rates: { ...DEFAULT_EAC_RATES, EUR: 0.87, GBP: 0.75 },
    date: new Date().toISOString().split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const amountParam = searchParams.get('amount');
    const toParam = searchParams.get('to');
    const fromParam = (searchParams.get('from') || 'USD').toUpperCase();

    const { rates, date } = await fetchLiveRates();

    let conversion: Record<string, unknown> | undefined = undefined;

    if (amountParam != null && toParam) {
      const amount = Number(amountParam) || 0;
      const target = toParam.toUpperCase();
      const rate = rates[target] ?? 1;
      const converted = Math.round(amount * rate);

      conversion = {
        from: fromParam,
        to: target,
        amount,
        rate,
        result: converted,
        formatted: formatCurrency(converted, target as EacCurrencyCode),
      };
    }

    return NextResponse.json(
      {
        success: true,
        base: 'USD',
        date,
        rates,
        conversion,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    console.error('[currency API error]', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process currency conversion',
        base: 'USD',
        rates: DEFAULT_EAC_RATES,
      },
      { status: 500 }
    );
  }
}
