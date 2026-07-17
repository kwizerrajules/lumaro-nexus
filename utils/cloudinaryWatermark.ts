/**
 * Bake a Lumaro Nexus watermark into public image URLs.
 *
 * All remote images go through `/api/watermarked` so the mark is baked into
 * the file bytes (survives Save-as). Cloudinary CDN overlays are not used —
 * they depend on a sticker asset that is easy to miss / invisible.
 */

export type WatermarkMode = 'preview' | 'light';

/** Already pointing at our bake-in proxy. */
function isWatermarkProxyUrl(url: string): boolean {
  return (
    url.includes('/api/watermarked') ||
    url.startsWith('/api/watermarked')
  );
}

const WATERMARK_PROXY_VERSION = '9';

/**
 * Absolute or site-relative URL for the server-side watermark proxy.
 * Keeps the original URL in a query param so Save-as downloads marked bytes.
 */
export function watermarkProxyUrl(
  url: string,
  mode: WatermarkMode = 'preview'
): string {
  // If we were given an existing proxy URL, unwrap to the source image
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
 * Non-remote / empty inputs are returned unchanged.
 */
export function watermarkImageUrl(
  url: string | null | undefined,
  mode: WatermarkMode = 'preview'
): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Always re-wrap proxy URLs so version bumps clear stale caches
  if (isWatermarkProxyUrl(trimmed)) {
    return watermarkProxyUrl(trimmed, mode);
  }

  // Any absolute http(s) image (Cloudinary, Architectural Designs, …)
  if (/^https?:\/\//i.test(trimmed)) {
    return watermarkProxyUrl(trimmed, mode);
  }

  // Site-relative public assets
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
