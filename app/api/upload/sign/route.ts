import { NextResponse } from "next/server";
import { createUploadSignature } from "../../../../src/lib/cloudinary";

/**
 * Returns a short-lived Cloudinary signature so the browser can upload
 * images directly to Cloudinary (bytes never buffered in this app).
 */
export async function GET() {
  try {
    const payload = createUploadSignature("house-projects");
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload signature" },
      { status: 500 }
    );
  }
}
