'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_SETTINGS,
} from '@/src/schemas/siteSettings.schema';
import {
  fetchSiteSettings,
  getCachedSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
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

    const load = (force = false) => {
      fetchSiteSettings({ force }).then((s) => {
        if (!cancelled) {
          setSettings(s);
          setLoading(false);
        }
      });
    };

    load(false);

    const onUpdated = () => load(true);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, onUpdated);
    };
  }, []);

  return { settings, loading };
}

/** Defaults helper for forms that need a fresh copy. */
export function getDefaultSiteSettingsForm() {
  return withDerivedSettings(DEFAULT_SITE_SETTINGS);
}
