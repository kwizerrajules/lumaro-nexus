import { Collection } from 'mongodb';
import getClientPromise from '../mongodb';
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsInput,
  type UpdateSiteSettingsInput,
} from '../../schemas/siteSettings.schema';

export type SiteSettings = SiteSettingsInput & {
  id: string;
  updatedAt: string;
};

type SiteSettingsDocument = SiteSettingsInput & {
  _id: string;
  updatedAt: Date;
  createdAt: Date;
};

const COLLECTION_NAME = 'site_settings';
const DB_NAME = 'LUMARO';
export const SITE_SETTINGS_DOC_ID = 'default';

const CACHE_TTL_MS = 60 * 1000;

type SettingsCache = {
  data: SiteSettings | null;
  expiresAt: number;
  inFlight: Promise<SiteSettings> | null;
};

const globalForCache = globalThis as unknown as {
  __siteSettingsCache?: SettingsCache;
};
const cache: SettingsCache =
  globalForCache.__siteSettingsCache ??
  (globalForCache.__siteSettingsCache = {
    data: null,
    expiresAt: 0,
    inFlight: null,
  });

function invalidateCache() {
  cache.data = null;
  cache.expiresAt = 0;
  cache.inFlight = null;
}

async function getCollection(): Promise<Collection<SiteSettingsDocument>> {
  const client = await getClientPromise();
  return client.db(DB_NAME).collection<SiteSettingsDocument>(COLLECTION_NAME);
}

function toSettings(doc: SiteSettingsDocument): SiteSettings {
  return {
    id: doc._id,
    primaryEmail: doc.primaryEmail,
    helpEmail: doc.helpEmail,
    websiteUrl: doc.websiteUrl,
    websiteDisplay: doc.websiteDisplay,
    phoneDisplay: doc.phoneDisplay,
    whatsappNumber: doc.whatsappNumber,
    address: doc.address,
    availability: doc.availability,
    footerTagline: doc.footerTagline,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function defaultsAsSettings(): SiteSettings {
  return {
    id: SITE_SETTINGS_DOC_ID,
    ...DEFAULT_SITE_SETTINGS,
    updatedAt: new Date(0).toISOString(),
  };
}

/**
 * Get site settings. Seeds MongoDB with current brand defaults on first read.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  if (!cache.inFlight) {
    cache.inFlight = (async () => {
      try {
        const collection = await getCollection();
        let doc = await collection.findOne({ _id: SITE_SETTINGS_DOC_ID });

        if (!doc) {
          const nowDate = new Date();
          const seed: SiteSettingsDocument = {
            _id: SITE_SETTINGS_DOC_ID,
            ...DEFAULT_SITE_SETTINGS,
            createdAt: nowDate,
            updatedAt: nowDate,
          };
          await collection.insertOne(seed);
          doc = seed;
        }

        const settings = toSettings(doc);
        cache.data = settings;
        cache.expiresAt = Date.now() + CACHE_TTL_MS;
        return settings;
      } catch (err) {
        console.error('[site-settings] DB read failed, using defaults:', err);
        return defaultsAsSettings();
      }
    })().finally(() => {
      cache.inFlight = null;
    });
  }

  return cache.inFlight;
}

export async function updateSiteSettings(
  data: UpdateSiteSettingsInput
): Promise<SiteSettings> {
  const collection = await getCollection();
  const now = new Date();

  // Ensure seed exists first
  await getSiteSettings();

  const result = await collection.findOneAndUpdate(
    { _id: SITE_SETTINGS_DOC_ID },
    {
      $set: {
        ...data,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        ...DEFAULT_SITE_SETTINGS,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  invalidateCache();

  if (!result) {
    const doc = await collection.findOne({ _id: SITE_SETTINGS_DOC_ID });
    if (!doc) throw new Error('Failed to update site settings');
    const settings = toSettings(doc);
    cache.data = settings;
    cache.expiresAt = Date.now() + CACHE_TTL_MS;
    return settings;
  }

  const settings = toSettings(result);
  cache.data = settings;
  cache.expiresAt = Date.now() + CACHE_TTL_MS;
  return settings;
}

/** Reset to seeded brand defaults. */
export async function resetSiteSettings(): Promise<SiteSettings> {
  const collection = await getCollection();
  const now = new Date();
  const doc: SiteSettingsDocument = {
    _id: SITE_SETTINGS_DOC_ID,
    ...DEFAULT_SITE_SETTINGS,
    createdAt: now,
    updatedAt: now,
  };
  await collection.replaceOne({ _id: SITE_SETTINGS_DOC_ID }, doc, {
    upsert: true,
  });
  invalidateCache();
  const settings = toSettings(doc);
  cache.data = settings;
  cache.expiresAt = Date.now() + CACHE_TTL_MS;
  return settings;
}

export const SiteSettingsModel = {
  get: getSiteSettings,
  update: updateSiteSettings,
  reset: resetSiteSettings,
};
