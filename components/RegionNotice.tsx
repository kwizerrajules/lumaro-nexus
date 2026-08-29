'use client';

import { useEffect, useState } from 'react';
import { X, WhatsappLogo } from '@phosphor-icons/react';
import { useVisitorRegion } from '@/hooks/useVisitorRegion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const DISMISS_KEY = 'region-notice-dismissed';

/**
 * Thin bar shown only to visitors outside Rwanda. Lumaro Nexus sells plans
 * for building in Rwanda, so this sets expectations without blocking anyone.
 * Dismissal is remembered per browser.
 */
export default function RegionNotice() {
  const { isOutsideRwanda } = useVisitorRegion();
  const { settings } = useSiteSettings();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!isOutsideRwanda || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bg-amber-950 text-amber-50 text-xs sm:text-sm">
      <div className="container mx-auto px-4 py-2 flex items-center gap-3">
        <p className="flex-1 leading-snug">
          Lumaro Nexus designs house plans for building in Rwanda — drawings are
          prepared for BPMIS and District One Stop Centre requirements.{' '}
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-white"
          >
            <WhatsappLogo size={14} weight="fill" />
            Ordering from abroad? Message us
          </a>
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss"
          className="shrink-0 p-1 -m-1 text-amber-200 hover:text-white transition-colors"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
