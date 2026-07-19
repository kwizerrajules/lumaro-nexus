/**
 * Bake a Lumaro Nexus watermark into public image URLs via `/api/watermarked`.
 *
 * Modes:
 * - preview (default): corner + side marks — clean on the website, still baked in
 * - light: 4 corners only (hero / small thumbs)
 * - dense: full diagonal grid — used when the user saves/downloads
 */

export type WatermarkMode = 'preview' | 'light' | 'dense';

/** Already pointing at our bake-in proxy. */
function isWatermarkProxyUrl(url: string): boolean {
  return (
    url.includes('/api/watermarked') ||
    url.startsWith('/api/watermarked')
  );
}

const WATERMARK_PROXY_VERSION = '10';

/**
 * Absolute or site-relative URL for the server-side watermark proxy.
 */
export function watermarkProxyUrl(
  url: string,
  mode: WatermarkMode = 'preview'
): string {
  let source = url;
  if (isWatermarkProxyUrl(url)) {
    try {
      const q = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
      const params = new URLSearchParams(q);
      const inner = params.get('url');
      if (inner) source = inner;
    } catch {
      // keep as-is
    }
  }

  const params = new URLSearchParams({
    url: source,
    mode,
    v: WATERMARK_PROXY_VERSION,
  });
  return `/api/watermarked?${params.toString()}`;
}

/**
 * Return a URL whose image bytes include the Lumaro watermark.
 */
export function watermarkImageUrl(
  url: string | null | undefined,
  mode: WatermarkMode = 'preview'
): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (isWatermarkProxyUrl(trimmed)) {
    return watermarkProxyUrl(trimmed, mode);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return watermarkProxyUrl(trimmed, mode);
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return watermarkProxyUrl(trimmed, mode);
  }

  return trimmed;
}

/** Map a list of image URLs through watermarking. */
export function watermarkImageUrls(
  urls: Array<string | null | undefined>,
  mode: WatermarkMode = 'preview'
): string[] {
  return urls.map((u) => watermarkImageUrl(u, mode)).filter(Boolean);
}
