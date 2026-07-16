import { NextRequest, NextResponse } from "next/server";
import { createUploadSignature } from "../../../../src/lib/cloudinary";
import { roleMiddleware } from "@/src/middleware/auth";

const STAFF_ROLES = ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"];

/**
 * Returns a short-lived Cloudinary signature so the browser can upload
 * images directly to Cloudinary (bytes never buffered in this app).
 * Staff-only — prevents anonymous abuse of Cloudinary upload quota.
 */
export async function GET(req: NextRequest) {
  const authResult = await roleMiddleware(req, STAFF_ROLES);
  if (authResult instanceof NextResponse) return authResult;

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
