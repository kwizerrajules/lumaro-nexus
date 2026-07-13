import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * @deprecated Prefer Cloudinary uploads via utils/cloudinaryUpload.ts
 * (browser → Cloudinary) or /api/upload. Kept for local/dev fallback only.
 */

type FileInput = {
  filePath?: string;
  base64?: string;
};

type FileSecurityOptions = {
  allowedExtensions?: string[];
  maxFileSizeMB?: number;
  uploadDir?: string;
};

const DEFAULT_OPTIONS: FileSecurityOptions = {
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  maxFileSizeMB: 5,
  uploadDir: path.join(process.cwd(), "public/uploads"),
};

export async function handleSecureFile(
  input: FileInput,
  options?: FileSecurityOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!fs.existsSync(opts.uploadDir!)) {
    fs.mkdirSync(opts.uploadDir!, { recursive: true });
  }

  let fileBuffer: Buffer;
  let ext: string;

  if (input.base64) {
    const matches = input.base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 string");

    const mimeType = matches[1];
    const data = matches[2];

    fileBuffer = Buffer.from(data, "base64");
    ext = `.${mimeType.split("/")[1]}`;
  } else if (input.filePath) {
    fileBuffer = fs.readFileSync(input.filePath);
    ext = path.extname(input.filePath);
  } else {
    throw new Error("No valid file input provided");
  }

  if (!opts.allowedExtensions!.includes(ext.toLowerCase())) {
    throw new Error(`File type not allowed: ${ext}`);
  }

  const fileSizeMB = fileBuffer.length / 1024 / 1024;
  if (fileSizeMB > opts.maxFileSizeMB!) {
    throw new Error(`File exceeds maximum size of ${opts.maxFileSizeMB}MB`);
  }

  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(opts.uploadDir!, fileName);

  await fs.promises.writeFile(filePath, fileBuffer);

  return `/uploads/${fileName}`;
}
