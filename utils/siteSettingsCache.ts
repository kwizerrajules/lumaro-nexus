import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsInput,
} from '@/src/schemas/siteSettings.schema';

export type PublicSiteSettings = SiteSettingsInput & {
  id?: string;
  updatedAt?: string;
  whatsappUrl: string;
  phoneTel: string;
};

export const SITE_SETTINGS_UPDATED_EVENT = 'site-settings-updated';

export function withDerivedSettings(s: SiteSettingsInput): PublicSiteSettings {
  const whatsappDigits = s.whatsappNumber.replace(/\D/g, '');
  const phoneDigits = s.phoneDisplay.replace(/\D/g, '') || whatsappDigits;
  return {
    ...s,
    whatsappNumber: whatsappDigits,
    whatsappUrl: `https://wa.me/${whatsappDigits}`,
    // Dial link must follow Phone display, not WhatsApp
    phoneTel: `+${phoneDigits}`,
  };
}

let cached: PublicSiteSettings | null = null;
let inFlight: Promise<PublicSiteSettings> | null = null;

export function getCachedSiteSettings(): PublicSiteSettings {
  return cached ?? withDerivedSettings(DEFAULT_SITE_SETTINGS);
}

export function setCachedSiteSettings(settings: PublicSiteSettings) {
  cached = settings;
}

export function invalidateSiteSettingsCache() {
  cached = null;
  inFlight = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));
  }
}

export async function fetchSiteSettings(
  options: { force?: boolean } = {}
): Promise<PublicSiteSettings> {
  if (!options.force && cached) return cached;
  if (!options.force && inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const url = options.force
        ? `/api/site-settings?t=${Date.now()}`
        : '/api/site-settings';
      const res = await fetch(url, {
        cache: options.force ? 'no-store' : 'default',
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        cached = withDerivedSettings(json.data);
        return cached;
      }
    } catch {
      // fall through
    }
    cached = withDerivedSettings(DEFAULT_SITE_SETTINGS);
    return cached;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
