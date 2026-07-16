import fs from 'fs';
import path from 'path';
import { assertCloudinaryConfigured, cloudinary } from '@/src/lib/cloudinary';
import { CLOUDINARY_WATERMARK_PUBLIC_ID } from '@/src/lib/watermarkPublicId';

export { CLOUDINARY_WATERMARK_PUBLIC_ID };

const LOCAL_STICKER_PATH = path.join(
  process.cwd(),
  'public/brand/lumaro-watermark-sticker.png'
);

let ensurePromise: Promise<string | null> | null = null;

/**
 * Upload the local watermark sticker to Cloudinary once (idempotent).
 * Existing product images are NOT modified — only this brand asset is uploaded.
 */
export async function ensureCloudinaryWatermark(): Promise<string | null> {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      assertCloudinaryConfigured();
    } catch {
      console.warn(
        '[watermark] Cloudinary not configured — skipping sticker upload'
      );
      return null;
    }

    if (!fs.existsSync(LOCAL_STICKER_PATH)) {
      console.warn('[watermark] Local sticker missing:', LOCAL_STICKER_PATH);
      return null;
    }

    const force = process.env.WATERMARK_FORCE_UPLOAD === 'true';

    if (!force) {
      try {
        await cloudinary.api.resource(CLOUDINARY_WATERMARK_PUBLIC_ID);
        console.log(
          '[watermark] Sticker already on Cloudinary:',
          CLOUDINARY_WATERMARK_PUBLIC_ID
        );
        return CLOUDINARY_WATERMARK_PUBLIC_ID;
      } catch {
        // Not found — upload below
      }
    }

    const result = await cloudinary.uploader.upload(LOCAL_STICKER_PATH, {
      public_id: CLOUDINARY_WATERMARK_PUBLIC_ID,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
      folder: undefined, // public_id already includes brand/
    });

    console.log(
      '[watermark] Sticker uploaded to Cloudinary:',
      result.public_id
    );
    return result.public_id;
  })().catch((err) => {
    console.error('[watermark] Failed to ensure sticker on Cloudinary:', err);
    ensurePromise = null;
    return null;
  });

  return ensurePromise;
}
