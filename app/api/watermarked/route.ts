import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import type { WatermarkMode } from '@/utils/cloudinaryWatermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const FONT_PATH = path.join(process.cwd(), 'public/fonts/Geist-Bold.ttf');
const STICKER_PATH = path.join(
  process.cwd(),
  'public/brand/lumaro-watermark-sticker.png'
);

let cachedFontDataUri: string | null = null;

/**
 * Embed Geist Bold as a data URI so SVG text works on Vercel
 * (serverless images have no system fonts like Arial/DejaVu).
 */
function getFontDataUri(): string | null {
  if (cachedFontDataUri) return cachedFontDataUri;
  try {
    if (!fs.existsSync(FONT_PATH)) return null;
    const buf = fs.readFileSync(FONT_PATH);
    cachedFontDataUri = `data:font/ttf;base64,${buf.toString('base64')}`;
    return cachedFontDataUri;
  } catch {
    return null;
  }
}

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

/** Count non-transparent pixels — used to detect font/tofu failures. */
async function opaquePixelCount(png: Buffer): Promise<number> {
  const { data } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 20) n++;
  }
  return n;
}

/**
 * Diagonal "Lumaro Nexus" using an embedded TTF (works on Vercel).
 * Falls back to tiling the pre-rendered PNG sticker if fonts fail.
 */
async function buildTextOverlay(
  width: number,
  height: number,
  mode: WatermarkMode
): Promise<Buffer> {
  const fontDataUri = getFontDataUri();
  const alphaScale = mode === 'light' ? 0.55 : 0.72;

  if (fontDataUri) {
    const fontSize = Math.max(
      26,
      Math.round(Math.min(width, height) * (mode === 'light' ? 0.055 : 0.07))
    );
    const stepX = Math.round(fontSize * 9.5);
    const stepY = Math.round(fontSize * 4.8);
    const cols = Math.ceil((width * 1.5) / stepX) + 1;
    const rows = Math.ceil((height * 1.5) / stepY) + 1;

    const marks: string[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = Math.round(col * stepX - width * 0.12);
        const y = Math.round(row * stepY - height * 0.06);
        marks.push(
          `<text x="${x + 2}" y="${y + 2}" fill="#0a0a0a">Lumaro Nexus</text>`
        );
        marks.push(
          `<text x="${x}" y="${y}" fill="#FFFFFF">Lumaro Nexus</text>`
        );
      }
    }

    const svg = Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'GeistWm';
              src: url('${fontDataUri}') format('truetype');
            }
          </style>
        </defs>
        <g font-family="GeistWm, sans-serif" font-size="${fontSize}"
           font-weight="700" text-anchor="middle"
           transform="rotate(-28 ${width / 2} ${height / 2})">
          ${marks.join('\n')}
        </g>
      </svg>`
    );

    const { data, info } = await sharp(svg)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = Math.round(data[i + 3] * alphaScale);
    }

    const overlay = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // If text rendered (font worked), use it; otherwise fall through to PNG tiles
    const pixels = await opaquePixelCount(overlay);
    if (pixels > 500) return overlay;
    console.warn(
      '[watermarked] SVG font rendered too few pixels — using PNG sticker fallback'
    );
  }

  return buildPngStickerOverlay(width, height, mode);
}

/** Font-free fallback: tile the pre-rendered transparent sticker PNG. */
async function buildPngStickerOverlay(
  width: number,
  height: number,
  mode: WatermarkMode
): Promise<Buffer> {
  if (!fs.existsSync(STICKER_PATH)) {
    console.error('[watermarked] Sticker missing:', STICKER_PATH);
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
  }

  const targetW = Math.max(
    140,
    Math.round(width * (mode === 'light' ? 0.3 : 0.36))
  );
  const opacity = mode === 'light' ? 0.5 : 0.7;

  let tile = await sharp(STICKER_PATH)
    .resize({ width: targetW, withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();

  const { data, info } = await sharp(tile)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * opacity);
  }
  tile = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  const rotated = await sharp(tile)
    .rotate(-28, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const rm = await sharp(rotated).metadata();
  const rw = rm.width || targetW;
  const rh = rm.height || Math.round(targetW * 0.35);

  const stepX = Math.round(rw * 1.05);
  const stepY = Math.round(rh * 1.25);
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let y = -rh; y < height + rh; y += stepY) {
    for (let x = -rw; x < width + rw; x += stepX) {
      composites.push({
        input: rotated,
        left: Math.round(x),
        top: Math.round(y),
      });
    }
  }

  return sharp({
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
}

async function previewBadge(canvasWidth: number): Promise<Buffer> {
  const badgeW = Math.min(140, Math.max(90, Math.round(canvasWidth * 0.12)));
  const badgeH = Math.max(22, Math.round(badgeW * 0.28));
  const fontSize = Math.max(11, Math.round(badgeH * 0.55));
  const fontDataUri = getFontDataUri();
  const fontFace = fontDataUri
    ? `@font-face{font-family:'GeistWm';src:url('${fontDataUri}') format('truetype');}`
    : '';
  const fontFamily = fontDataUri ? 'GeistWm, sans-serif' : 'sans-serif';

  return sharp(
    Buffer.from(
      `<svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">
        <defs><style>${fontFace}</style></defs>
        <rect width="100%" height="100%" rx="3" fill="rgba(23,23,23,0.78)"/>
        <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
          font-family="${fontFamily}" font-size="${fontSize}"
          font-weight="700" fill="#FBBF24" letter-spacing="1.5">PREVIEW</text>
      </svg>`
    )
  )
    .png()
    .toBuffer();
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

  const overlay = await buildTextOverlay(width, height, mode);
  composites.push({ input: overlay, left: 0, top: 0 });

  if (mode === 'preview') {
    const badge = await previewBadge(width);
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
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Watermark-Version': '8',
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
