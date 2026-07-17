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

export function withDerivedSettings(s: SiteSettingsInput): PublicSiteSettings {
  const digits = s.whatsappNumber.replace(/\D/g, '');
  return {
    ...s,
    whatsappNumber: digits,
    whatsappUrl: `https://wa.me/${digits}`,
    phoneTel: `+${digits}`,
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
}

export async function fetchSiteSettings(): Promise<PublicSiteSettings> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch('/api/site-settings');
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
