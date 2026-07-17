/** Max image size for Cloudinary uploads (5MB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function assertValidImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`File type not allowed: ${file.type || file.name}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 5MB limit`);
  }
}

type SignResponse = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
};

async function getUploadSignature(): Promise<SignResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const res = await fetch("/api/upload/sign", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to get upload signature");
  }
  return data;
}

/**
 * Upload a single image directly to Cloudinary (signed).
 * Image bytes go browser → Cloudinary CDN; only the URL is returned.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  assertValidImage(file);

  const sign = await getUploadSignature();
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body }
  );

  const result = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(result.error?.message || "Cloudinary upload failed");
  }

  return result.secure_url as string;
}

/** Upload many images in parallel; preserves order. */
export async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImageToCloudinary(file)));
}
