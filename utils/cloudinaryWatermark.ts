/**
 * Bake a Lumaro Nexus watermark into Cloudinary delivery URLs.
 *
 * Original product uploads stay clean in Cloudinary / the database.
 * Public pages request a transformed URL so "Save image" still shows the mark.
 *
 * Sticker asset: brand/lumaro-watermark (auto-uploaded via ensureWatermark).
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

  // Six spots: top row + bottom row (covers the whole frame)
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
  // New marker: six-spot grid uses north_west + south_east together
  return (
    url.includes('g_north_west') &&
    url.includes('g_south_east') &&
    url.includes('lumaro-watermark')
  );
}

/**
 * Return a Cloudinary URL with watermark transforms injected.
 * Non-Cloudinary URLs are returned unchanged (use CSS sticker as fallback).
 */
export function watermarkImageUrl(
  url: string | null | undefined,
  mode: WatermarkMode = 'preview'
): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/image/upload/')) {
    return trimmed;
  }

  if (alreadyWatermarked(trimmed)) return trimmed;

  const marker = '/image/upload/';
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return trimmed;

  const before = trimmed.slice(0, idx + marker.length);
  let after = trimmed.slice(idx + marker.length);

  // Drop older single-center watermark segments so we don't stack marks
  after = after.replace(
    /l_brand:lumaro-watermark[^/]*\/fl_layer_apply(?:,g_center)?\/?/g,
    ''
  );

  const transforms = textTransforms(mode);

  return `${before}${transforms}/${after}`.replace(/\/{2,}/g, '/');
}

/** Map a list of image URLs through watermarking. */
export function watermarkImageUrls(
  urls: Array<string | null | undefined>,
  mode: WatermarkMode = 'preview'
): string[] {
  return urls.map((u) => watermarkImageUrl(u, mode)).filter(Boolean);
}
