import { NextRequest, NextResponse } from "next/server";
import {
  MAX_FILE_SIZE_BYTES,
  uploadBufferToCloudinary,
} from "../../../src/lib/cloudinary";
import { roleMiddleware } from "@/src/middleware/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const STAFF_ROLES = ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"];

/**
 * Multipart fallback upload. Prefer client → Cloudinary direct upload via /api/upload/sign.
 * Accepts one or more files under field name "files" (or a single "file").
 */
export async function POST(req: NextRequest) {
  const authResult = await roleMiddleware(req, STAFF_ROLES);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await req.formData();
    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((f): f is File => f instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.type || file.name}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds maximum size of 5MB` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBufferToCloudinary(buffer, {
        filename: file.name,
      });
      urls.push(result.secure_url);
    }

    return NextResponse.json(
      { urls, url: urls[0] },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
