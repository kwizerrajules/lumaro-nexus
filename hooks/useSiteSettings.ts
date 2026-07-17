'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_SETTINGS,
} from '@/src/schemas/siteSettings.schema';
import {
  fetchSiteSettings,
  getCachedSiteSettings,
  withDerivedSettings,
  type PublicSiteSettings,
} from '@/utils/siteSettingsCache';

export type { PublicSiteSettings };
export {
  getCachedSiteSettings,
  invalidateSiteSettingsCache,
} from '@/utils/siteSettingsCache';

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(() =>
    getCachedSiteSettings()
  );
  const [loading, setLoading] = useState(
    () => getCachedSiteSettings().updatedAt === undefined
  );

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}

/** Defaults helper for forms that need a fresh copy. */
export function getDefaultSiteSettingsForm() {
  return withDerivedSettings(DEFAULT_SITE_SETTINGS);
}
