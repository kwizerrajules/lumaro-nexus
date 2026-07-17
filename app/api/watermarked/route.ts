import { NextRequest, NextResponse } from 'next/server';
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

/**
 * One full-frame overlay: diagonal "Lumaro Nexus" with dark underlay + white
 * fill so the mark stays readable on light brick and dark roofs.
 */
async function buildTextOverlay(
  width: number,
  height: number,
  mode: WatermarkMode
): Promise<Buffer> {
  const fontSize = Math.max(
    26,
    Math.round(Math.min(width, height) * (mode === 'light' ? 0.055 : 0.07))
  );
  const alphaScale = mode === 'light' ? 0.55 : 0.72;
  const stepX = Math.round(fontSize * 9.5);
  const stepY = Math.round(fontSize * 4.8);
  const cols = Math.ceil((width * 1.5) / stepX) + 1;
  const rows = Math.ceil((height * 1.5) / stepY) + 1;

  const marks: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = Math.round(col * stepX - width * 0.12);
      const y = Math.round(row * stepY - height * 0.06);
      // Dark shadow first (contrast), then white brand text
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
      <g font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="${fontSize}"
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

  // Fade the whole overlay uniformly (keeps RGB of both white + dark glyphs)
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = Math.round(data[i + 3] * alphaScale);
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
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

  const overlay = await buildTextOverlay(width, height, mode);
  composites.push({ input: overlay, left: 0, top: 0 });

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
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Watermark-Version': '7',
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
