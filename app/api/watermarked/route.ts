import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import type { WatermarkMode } from '@/utils/cloudinaryWatermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * IMPORTANT: Do NOT render watermark text via SVG fonts on Vercel.
 * Serverless runtimes have no system fonts, so SVG text becomes empty
 * "tofu" boxes. We only composite pre-rendered PNG stickers (pixels).
 */

const ALLOWED_HOST_SUFFIXES = [
  'architecturaldesigns.com',
  'res.cloudinary.com',
  'cloudinary.com',
  'lumaronexus.com',
  'vercel.app',
];

const MAX_UPSTREAM_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

const STICKER_PATH = path.join(
  process.cwd(),
  'public/brand/lumaro-watermark-sticker.png'
);
const BADGE_PATH = path.join(
  process.cwd(),
  'public/brand/lumaro-preview-badge.png'
);

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal')
  ) {
    return true;
  }
  if (/^(10\.|192\.168\.|169\.254\.|127\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function isAllowedHost(hostname: string, requestHost: string): boolean {
  const h = hostname.toLowerCase();
  const rh = requestHost.toLowerCase().split(':')[0];
  if (h === rh) return true;
  if (isPrivateHostname(h) && h !== rh) return false;
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => h === suffix || h.endsWith(`.${suffix}`)
  );
}

function resolveUpstreamUrl(raw: string, req: NextRequest): URL | null {
  try {
    const requestHost = req.headers.get('host') || req.nextUrl.host;
    if (raw.startsWith('/') && !raw.startsWith('//')) {
      return new URL(raw, req.nextUrl.origin);
    }
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!isAllowedHost(u.hostname, requestHost)) return null;
    return u;
  } catch {
    return null;
  }
}

function parseMode(value: string | null): WatermarkMode {
  return value === 'light' ? 'light' : 'preview';
}

async function fadePng(input: Buffer, opacity: number): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * opacity);
  }
  const out = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
  return Buffer.from(out);
}

/**
 * Tile pre-rendered "Lumaro Nexus" PNG diagonally across the frame.
 * No fonts required at runtime — works on Vercel.
 */
async function buildPngOverlay(
  width: number,
  height: number,
  mode: WatermarkMode
): Promise<Buffer> {
  if (!fs.existsSync(STICKER_PATH)) {
    throw new Error(`Watermark sticker missing: ${STICKER_PATH}`);
  }

  const targetW = Math.max(
    150,
    Math.round(width * (mode === 'light' ? 0.28 : 0.34))
  );
  const opacity = mode === 'light' ? 0.45 : 0.62;

  const resized = Buffer.from(
    await sharp(STICKER_PATH)
      .resize({ width: targetW, withoutEnlargement: true })
      .ensureAlpha()
      .png()
      .toBuffer()
  );

  const tile = await fadePng(resized, opacity);

  const rotated = Buffer.from(
    await sharp(tile)
      .rotate(-28, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  );

  const rm = await sharp(rotated).metadata();
  const rw = rm.width || targetW;
  const rh = rm.height || Math.round(targetW * 0.2);

  const stepX = Math.round(rw * 1.12);
  const stepY = Math.round(rh * 1.55);
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let y = -Math.round(rh * 0.5); y < height + rh; y += stepY) {
    for (let x = -Math.round(rw * 0.3); x < width + rw; x += stepX) {
      composites.push({
        input: rotated,
        left: Math.round(x),
        top: Math.round(y),
      });
    }
  }

  const overlay = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return Buffer.from(overlay);
}

async function buildPreviewBadge(canvasWidth: number): Promise<Buffer | null> {
  if (!fs.existsSync(BADGE_PATH)) return null;

  const badgeW = Math.min(130, Math.max(96, Math.round(canvasWidth * 0.12)));
  const text = Buffer.from(
    await sharp(BADGE_PATH)
      .resize({ width: Math.round(badgeW * 0.78), withoutEnlargement: true })
      .ensureAlpha()
      .png()
      .toBuffer()
  );
  const tm = await sharp(text).metadata();
  const tw = tm.width || 80;
  const th = tm.height || 18;
  const padX = 12;
  const padY = 7;
  const boxW = tw + padX * 2;
  const boxH = th + padY * 2;

  const box = Buffer.from(
    await sharp({
      create: {
        width: boxW,
        height: boxH,
        channels: 4,
        background: { r: 23, g: 23, b: 23, alpha: 200 },
      },
    })
      .png()
      .toBuffer()
  );

  return Buffer.from(
    await sharp(box)
      .composite([{ input: text, left: padX, top: padY }])
      .png()
      .toBuffer()
  );
}

async function buildWatermarkedBuffer(
  input: Buffer,
  mode: WatermarkMode
): Promise<{ buffer: Buffer; contentType: string }> {
  const maxEdge = mode === 'light' ? 1600 : 1400;

  const base = await sharp(input, { failOn: 'none', animated: false })
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true });

  const width = base.info.width;
  const height = base.info.height;
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  const overlay = await buildPngOverlay(width, height, mode);
  composites.push({ input: overlay, left: 0, top: 0 });

  if (mode === 'preview') {
    const badge = await buildPreviewBadge(width);
    if (badge) {
      const bm = await sharp(badge).metadata();
      const bw = bm.width || 100;
      const bh = bm.height || 28;
      composites.push({
        input: badge,
        left: Math.max(0, width - bw - 14),
        top: Math.max(0, height - bh - 14),
      });
    }
  }

  const buffer = Buffer.from(
    await sharp(base.data)
      .composite(composites)
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  );

  return { buffer, contentType: 'image/jpeg' };
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  const mode = parseMode(req.nextUrl.searchParams.get('mode'));

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const upstream = resolveUpstreamUrl(rawUrl, req);
  if (!upstream) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const upstreamRes = await fetch(upstream.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LumaroNexusWatermark/1.0',
        Accept: 'image/*,*/*;q=0.8',
      },
      redirect: 'follow',
      next: { revalidate: 86400 },
    });
    clearTimeout(timer);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstreamRes.status}` },
        { status: 502 }
      );
    }

    const contentType = upstreamRes.headers.get('content-type') || '';
    if (
      contentType &&
      !contentType.startsWith('image/') &&
      !contentType.includes('octet-stream')
    ) {
      return NextResponse.json(
        { error: 'Upstream is not an image' },
        { status: 400 }
      );
    }

    const arr = await upstreamRes.arrayBuffer();
    if (arr.byteLength === 0 || arr.byteLength > MAX_UPSTREAM_BYTES) {
      return NextResponse.json(
        { error: 'Invalid image size' },
        { status: 400 }
      );
    }

    const { buffer, contentType: outType } = await buildWatermarkedBuffer(
      Buffer.from(arr),
      mode
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': outType,
        // Shorter browser cache so watermark version bumps apply faster
        'Cache-Control':
          'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'X-Watermark-Version': '9',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[watermarked]', err);
    return NextResponse.json(
      { error: 'Failed to watermark image' },
      { status: 500 }
    );
  }
}
