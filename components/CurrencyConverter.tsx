'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  EacCurrencyCode,
  EAC_CURRENCY_LIST,
  EAC_CURRENCIES,
  formatCurrency,
  convertUsdTo,
  DEFAULT_EAC_RATES,
  fetchExchangeRates,
  getSavedCurrency,
  saveCurrency,
} from '@/utils/currency';

interface CurrencyConverterProps {
  usdPrice: number;
  onCurrencyChange?: (
    currency: EacCurrencyCode,
    convertedAmount: number,
    formattedText: string
  ) => void;
  className?: string;
  compact?: boolean;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  usdPrice,
  onCurrencyChange,
  className = '',
  compact = false,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<EacCurrencyCode>('USD');
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_EAC_RATES);
  const [isLive, setIsLive] = useState(false);

  // Initialize with user saved currency
  useEffect(() => {
    const saved = getSavedCurrency();
    setSelectedCurrency(saved);
  }, []);

  // Fetch real exchange rates from our API
  useEffect(() => {
    let cancelled = false;
    fetchExchangeRates().then((data) => {
      if (cancelled) return;
      if (data && data.rates) {
        setRates(data.rates);
        setIsLive(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const convertedAmount = useMemo(() => {
    return convertUsdTo(usdPrice, selectedCurrency, rates);
  }, [usdPrice, selectedCurrency, rates]);

  const formattedConverted = useMemo(() => {
    return formatCurrency(convertedAmount, selectedCurrency);
  }, [convertedAmount, selectedCurrency]);

  const activeRate = useMemo(() => {
    return rates[selectedCurrency] ?? DEFAULT_EAC_RATES[selectedCurrency] ?? 1;
  }, [rates, selectedCurrency]);

  // Notify parent on change
  useEffect(() => {
    if (onCurrencyChange) {
      onCurrencyChange(
        selectedCurrency,
        convertedAmount,
        selectedCurrency === 'USD' ? '' : `approx. ${formattedConverted}`
      );
    }
  }, [selectedCurrency, convertedAmount, formattedConverted, onCurrencyChange]);

  const handleSelect = (code: EacCurrencyCode) => {
    setSelectedCurrency(code);
    saveCurrency(code);
  };

  const isUsd = selectedCurrency === 'USD';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Price presentation: USD primary + converted EAC tag */}
      <div className="flex flex-wrap items-baseline gap-2.5">
        <div className="flex items-baseline gap-1">
          <span className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wider">
            From
          </span>
          <span className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
            {formatCurrency(usdPrice, 'USD')}
          </span>
          <span className="text-xs font-semibold text-neutral-400">USD</span>
        </div>

        {!isUsd && (
          <div className="inline-flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-md text-base sm:text-lg font-semibold animate-fadeIn">
            <span className="text-xs font-normal text-amber-700">≈</span>
            <span>{formattedConverted}</span>
          </div>
        )}
      </div>

      {/* Sleek EAC currency selector pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mr-1 shrink-0">
          View in:
        </span>
        {EAC_CURRENCY_LIST.map((curr) => {
          const active = selectedCurrency === curr.code;
          return (
            <button
              key={curr.code}
              type="button"
              onClick={() => handleSelect(curr.code)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                active
                  ? 'bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900'
                  : 'bg-stone-100/80 text-neutral-600 hover:bg-stone-200/80 hover:text-neutral-900 border border-transparent'
              }`}
              title={curr.name}
            >
              <span>{curr.flag}</span>
              <span>{curr.code}</span>
            </button>
          );
        })}
      </div>

      {/* Live exchange rate note (clean and tiny) */}
      {!isUsd && (
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span>
            1 USD ≈ {new Intl.NumberFormat(EAC_CURRENCIES[selectedCurrency].locale).format(Math.round(activeRate))} {selectedCurrency}
          </span>
          <span className="text-neutral-300">·</span>
          <span>Live EAC rate</span>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
