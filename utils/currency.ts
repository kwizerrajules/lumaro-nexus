export type EacCurrencyCode = 'USD' | 'RWF' | 'KES' | 'UGX' | 'TZS' | 'BIF';

export interface CurrencyConfig {
  code: EacCurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
  decimals: number;
}

export const EAC_CURRENCIES: Record<EacCurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
    decimals: 0,
  },
  RWF: {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'RWF',
    flag: '🇷🇼',
    locale: 'en-RW',
    decimals: 0,
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KES',
    flag: '🇰🇪',
    locale: 'en-KE',
    decimals: 0,
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'UGX',
    flag: '🇺🇬',
    locale: 'en-UG',
    decimals: 0,
  },
  TZS: {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TZS',
    flag: '🇹🇿',
    locale: 'en-TZ',
    decimals: 0,
  },
  BIF: {
    code: 'BIF',
    name: 'Burundian Franc',
    symbol: 'BIF',
    flag: '🇧🇮',
    locale: 'fr-BI',
    decimals: 0,
  },
};

/** Sensible market fallback rates (per 1 USD) if external network fails */
export const DEFAULT_EAC_RATES: Record<EacCurrencyCode, number> = {
  USD: 1,
  RWF: 1473.7,
  KES: 129.5,
  UGX: 3933.0,
  TZS: 2648.1,
  BIF: 2999.9,
};

export const EAC_CURRENCY_LIST: CurrencyConfig[] = [
  EAC_CURRENCIES.USD,
  EAC_CURRENCIES.RWF,
  EAC_CURRENCIES.KES,
  EAC_CURRENCIES.UGX,
  EAC_CURRENCIES.TZS,
];

const STORAGE_KEY = 'lumaro_user_currency';
const RATES_CACHE_KEY = 'lumaro_exchange_rates_v1';
const RATES_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Format any numerical amount in a target currency */
export function formatCurrency(
  amount: number,
  currencyCode: EacCurrencyCode | string = 'USD'
): string {
  const code = (currencyCode.toUpperCase() as EacCurrencyCode) in EAC_CURRENCIES
    ? (currencyCode.toUpperCase() as EacCurrencyCode)
    : 'USD';

  const config = EAC_CURRENCIES[code] || EAC_CURRENCIES.USD;
  const num = Number(amount) || 0;

  if (code === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(num);
  }

  // Format with currency code prefix e.g. "RWF 736,850" or "KES 64,750"
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(Math.round(num));

  return `${config.symbol} ${formattedNumber}`;
}

/** Convert a USD base amount to a target currency using provided rates */
export function convertUsdTo(
  usdAmount: number,
  targetCurrency: EacCurrencyCode | string,
  rates: Record<string, number> = DEFAULT_EAC_RATES
): number {
  const code = targetCurrency.toUpperCase();
  if (code === 'USD' || !code) return Number(usdAmount) || 0;
  const rate = rates[code] ?? DEFAULT_EAC_RATES[code as EacCurrencyCode] ?? 1;
  return Math.round((Number(usdAmount) || 0) * rate);
}

/** Client-side saved currency preference */
export function getSavedCurrency(): EacCurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as EacCurrencyCode;
    if (saved && saved in EAC_CURRENCIES) return saved;
  } catch {
    // ignore
  }
  return 'USD';
}

export function saveCurrency(currency: EacCurrencyCode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // ignore
  }
}

export interface ExchangeRatesData {
  rates: Record<string, number>;
  date: string;
  source?: string;
}

/** Fetch live exchange rates with 1-hour in-memory/sessionStorage cache */
export async function fetchExchangeRates(): Promise<ExchangeRatesData> {
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < RATES_TTL_MS && parsed.rates) {
          return { rates: parsed.rates, date: parsed.date || 'today' };
        }
      }
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch('/api/currency');
    if (!res.ok) throw new Error(`Currency API ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            RATES_CACHE_KEY,
            JSON.stringify({
              rates: data.rates,
              date: data.date,
              timestamp: Date.now(),
            })
          );
        } catch {
          // ignore
        }
      }
      return { rates: data.rates, date: data.date };
    }
  } catch (err) {
    console.warn('[currency] failed to fetch live rates, using defaults:', err);
  }

  return { rates: DEFAULT_EAC_RATES, date: 'fallback' };
}
