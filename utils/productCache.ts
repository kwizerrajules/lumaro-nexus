import axios from "axios";

const CACHE_KEY = "lumaro_houseprojects_v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CachedPayload = {
  items: any[];
  cachedAt: number;
};

function readCache(): CachedPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.items?.length || !parsed.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(items: any[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedPayload = { items, cachedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode — ignore
  }
}

/** Merge/replace cache with a fresh list from the API */
export function setCachedHouseProjects(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return;
  const existing = readCache()?.items || [];
  const byKey = new Map<string, any>();

  for (const item of existing) {
    const key = item.slug || item.id;
    if (key) byKey.set(String(key), item);
  }
  for (const item of items) {
    const key = item.slug || item.id;
    if (key) byKey.set(String(key), { ...byKey.get(String(key)), ...item });
  }

  writeCache(Array.from(byKey.values()));
}

export function getCachedHouseProjects(): any[] {
  return readCache()?.items || [];
}

export function getCachedHouseProject(slugOrId: string): any | null {
  const key = String(slugOrId || "").trim();
  if (!key) return null;
  const items = getCachedHouseProjects();
  return (
    items.find(
      (p) =>
        String(p.slug || "") === key ||
        String(p.id || "") === key
    ) || null
  );
}

/**
 * Fetch house projects: serve from session cache when fresh,
 * otherwise hit the API and cache the result for later pages/detail.
 */
export async function fetchHouseProjects(params: {
  limit?: number;
  category?: string;
  style?: string;
  search?: string;
  force?: boolean;
} = {}): Promise<any[]> {
  const { force = false, limit = 100, category, style, search } = params;
  const hasFilters = !!(category || style || search);

  if (!force && !hasFilters) {
    const cached = getCachedHouseProjects();
    if (cached.length > 0) {
      return cached.slice(0, limit);
    }
  }

  const res = await axios.get("/api/houseprojects", {
    params: { limit, category, style, search },
  });
  const items = res.data?.data || [];

  // Only store the unfiltered catalog snapshot for detail reuse
  if (!hasFilters) {
    setCachedHouseProjects(items);
  }

  return items;
}

/** Upsert a single full project (e.g. after detail fetch) into the cache */
export function cacheHouseProject(project: any) {
  if (!project?.id && !project?.slug) return;
  setCachedHouseProjects([project]);
}
