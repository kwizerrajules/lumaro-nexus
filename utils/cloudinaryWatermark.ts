/**
 * Bake a Lumaro Nexus watermark into public image URLs.
 *
 * - Cloudinary: inject overlay transforms into the delivery URL.
 * - Other hosts: route through /api/watermarked so the bytes themselves
 *   include the mark (CSS overlays do not survive "Save image as").
 */

import { CLOUDINARY_WATERMARK_PUBLIC_ID } from '@/src/lib/watermarkPublicId';

export type WatermarkMode = 'preview' | 'light';

/**
 * ~6 sticker placements across the image (3×2 grid), not a single center mark.
 */
function logoGridTransform(mode: WatermarkMode): string {
  const overlayId = CLOUDINARY_WATERMARK_PUBLIC_ID.replace(/\//g, ':');
  const opacity = mode === 'light' ? 22 : 34;
  const width = mode === 'light' ? 0.2 : 0.24;

  const spots = [
    'g_north_west,x_16,y_16',
    'g_north,y_16',
    'g_north_east,x_16,y_16',
    'g_south_west,x_16,y_16',
    'g_south,y_16',
    'g_south_east,x_16,y_16',
  ];

  return spots
    .map(
      (pos) =>
        `l_${overlayId},w_${width},o_${opacity}/fl_layer_apply,${pos}`
    )
    .join('/');
}

function textTransforms(mode: WatermarkMode): string {
  if (mode === 'light') {
    return ['c_limit,w_1600,q_auto:good,f_auto', logoGridTransform('light')].join(
      '/'
    );
  }

  return [
    'c_limit,w_1400,q_auto:good,f_auto',
    logoGridTransform('preview'),
    'l_text:Arial_22:Preview,co_rgb:FBBF24,o_80',
    'fl_layer_apply,g_south_east,x_14,y_14',
  ].join('/');
}

/** True if this URL already includes our tiled watermark transforms. */
function alreadyWatermarked(url: string): boolean {
  return (
    url.includes('g_north_west') &&
    url.includes('g_south_east') &&
    url.includes('lumaro-watermark')
  );
}

function isCloudinaryUploadUrl(url: string): boolean {
  return (
    url.includes('res.cloudinary.com') && url.includes('/image/upload/')
  );
}

/** Already pointing at our bake-in proxy. */
function isWatermarkProxyUrl(url: string): boolean {
  return (
    url.includes('/api/watermarked') ||
    url.startsWith('/api/watermarked')
  );
}

/**
 * Absolute or site-relative URL for the server-side watermark proxy.
 * Keeps the original URL in a query param so Save-as downloads marked bytes.
 */
export function watermarkProxyUrl(
  url: string,
  mode: WatermarkMode = 'preview'
): string {
  const params = new URLSearchParams({
    url,
    mode,
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

  if (isWatermarkProxyUrl(trimmed)) return trimmed;

  // Cloudinary delivery URL — bake overlays into the CDN URL
  if (isCloudinaryUploadUrl(trimmed)) {
    if (alreadyWatermarked(trimmed)) return trimmed;

    const marker = '/image/upload/';
    const idx = trimmed.indexOf(marker);
    if (idx === -1) return trimmed;

    const before = trimmed.slice(0, idx + marker.length);
    let after = trimmed.slice(idx + marker.length).replace(/^\/+/, '');

    // Drop older single-center watermark segments so we don't stack marks
    after = after.replace(
      /l_brand:lumaro-watermark[^/]*\/fl_layer_apply(?:,g_center)?\/?/g,
      ''
    );

    const transforms = textTransforms(mode);
    // Do NOT collapse all "//" — that breaks "https://"
    return `${before}${transforms}/${after}`;
  }

  // Absolute http(s) image on another host → server-side bake-in proxy
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
