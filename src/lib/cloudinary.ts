import { v2 as cloudinary } from "cloudinary";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary, MAX_FILE_SIZE_BYTES };

export function assertCloudinaryConfigured() {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
}

/** Signed params for browser → Cloudinary direct upload (no app buffering). */
export function createUploadSignature(folder = "house-projects") {
  assertCloudinaryConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
  };
}

/** Server-side stream upload when multipart goes through the API. */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  options?: { folder?: string; filename?: string }
): Promise<{ secure_url: string; public_id: string }> {
  assertCloudinaryConfigured();

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds maximum size of 5MB");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || "house-projects",
        resource_type: "image",
        public_id: options?.filename?.replace(/\.[^.]+$/, ""),
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}
