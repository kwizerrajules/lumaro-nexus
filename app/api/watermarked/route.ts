import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import type { WatermarkMode } from '@/utils/cloudinaryWatermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STICKER_PATH = path.join(
  process.cwd(),
  'public/brand/lumaro-watermark-sticker.png'
);

/** Hosts we will fetch and watermark (SSRF guard). */
const ALLOWED_HOST_SUFFIXES = [
  'architecturaldesigns.com',
  'res.cloudinary.com',
  'cloudinary.com',
  'lumaronexus.com',
  'vercel.app',
];

const MAX_UPSTREAM_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

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
  // Same-origin (including localhost in dev) is always fine
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

async function prepareSticker(
  canvasWidth: number,
  mode: WatermarkMode
): Promise<Buffer | null> {
  if (!fs.existsSync(STICKER_PATH)) return null;

  const stickerWidth = Math.max(
    80,
    Math.round(canvasWidth * (mode === 'light' ? 0.2 : 0.24))
  );
  const opacity = mode === 'light' ? 0.28 : 0.4;

  const resized = await sharp(STICKER_PATH)
    .resize({ width: stickerWidth, withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Reduce opacity via dest-in with a solid alpha tile
  return sharp(resized)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([
          255,
          255,
          255,
          Math.round(255 * opacity),
        ]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
}

function previewBadge(canvasWidth: number): Buffer {
  const badgeW = Math.min(140, Math.max(90, Math.round(canvasWidth * 0.12)));
  const badgeH = Math.max(22, Math.round(badgeW * 0.28));
  const fontSize = Math.max(11, Math.round(badgeH * 0.55));
  return Buffer.from(
    `<svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="3" fill="rgba(23,23,23,0.78)"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}"
        font-weight="700" fill="#FBBF24" letter-spacing="1.5">PREVIEW</text>
    </svg>`
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

  const sticker = await prepareSticker(width, mode);
  if (sticker) {
    const sm = await sharp(sticker).metadata();
    const sw = sm.width || 100;
    const sh = sm.height || 40;
    const padX = Math.max(10, Math.round(width * 0.02));
    const padY = Math.max(10, Math.round(height * 0.02));

    const positions = [
      { left: padX, top: padY },
      { left: Math.round((width - sw) / 2), top: padY },
      { left: Math.max(padX, width - sw - padX), top: padY },
      { left: padX, top: Math.max(padY, height - sh - padY) },
      {
        left: Math.round((width - sw) / 2),
        top: Math.max(padY, height - sh - padY),
      },
      {
        left: Math.max(padX, width - sw - padX),
        top: Math.max(padY, height - sh - padY),
      },
    ];

    for (const pos of positions) {
      composites.push({
        input: sticker,
        left: Math.max(0, pos.left),
        top: Math.max(0, pos.top),
      });
    }
  }

  if (mode === 'preview') {
    const badge = previewBadge(width);
    const bm = await sharp(badge).metadata();
    const bw = bm.width || 100;
    const bh = bm.height || 28;
    composites.push({
      input: badge,
      left: Math.max(0, width - bw - 14),
      top: Math.max(0, height - bh - 14),
    });
  }

  const buffer = await sharp(base.data)
    .composite(composites)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

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
      // Fresh enough for previews; browsers still cache our response
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
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
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
