import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "../../../src/lib/models/houseProject.model";
import { sanitizeEverything } from "../../../src/security/sanitizeEverything";
import { roleMiddleware } from "@/src/middleware/auth";
import { v4 as uuidv4 } from "uuid";

const STAFF_ROLES = ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"];

let cachedTypes: string[] = [];
let cacheTime = 0;

export async function GET(req: NextRequest) {
  try {
    // Backup if instrumentation did not run (e.g. some serverless cold starts).
    // Never let watermark setup fail this API response.
    void import("@/src/lib/ensureWatermark")
      .then((m) => m.ensureCloudinaryWatermark())
      .catch(() => {});

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const style = searchParams.get("style") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await HouseProjectModel.getAll({
      limit,
      offset,
      status,
      category,
      style,
      search,
    });

    // Optional: cache all types for filter dropdowns (refresh every 5 mins)
    if (!cachedTypes.length || Date.now() - cacheTime > 5 * 60 * 1000) {
      const allProjects = await HouseProjectModel.getAll({ limit: 10000, offset: 0 });
      cachedTypes = Array.from(new Set(allProjects.data.map(p => p.type).filter(Boolean)));
      cacheTime = Date.now();
    }

    return NextResponse.json(
      { ...result, types: cachedTypes },
      {
        headers: {
          // Short edge cache so new admin uploads show up quickly
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await roleMiddleware(req, STAFF_ROLES);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const rawBody = await req.json();
    const body = sanitizeEverything(rawBody);

    const now = new Date().toISOString();
    const projectData = {
      id: uuidv4(),
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      // Expect Cloudinary (or other CDN) URLs only — no binary/base64 blobs
      thumbnail: body.thumbnail || "",
      additionalImages: Array.isArray(body.additionalImages)
        ? body.additionalImages
        : [],
      status: body.status || "planned",
      rooms: Number(body.rooms) || 0,
      // Omit zeros — Zod positive() rejects 0; empty optionals must be undefined
      ...(Number(body.height) > 0 ? { height: Number(body.height) } : {}),
      ...(Number(body.width) > 0 ? { width: Number(body.width) } : {}),
      ...(Number(body.areaSqFt) > 0 ? { areaSqFt: Number(body.areaSqFt) } : {}),
      ...(String(body.location || "").trim()
        ? { location: String(body.location).trim() }
        : {}),
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      floors: Number(body.floors) || 0,
      ...(String(body.category || "").trim()
        ? { category: String(body.category).trim() }
        : {}),
      ...(String(body.style || "").trim()
        ? { style: String(body.style).trim() }
        : {}),
      ...(String(body.type || "").trim().length >= 5
        ? { type: String(body.type).trim() }
        : {}),
      price: Number(body.price) || 0,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };

    const project = await HouseProjectModel.create(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    // Surface Zod issues as readable text for the admin form
    if (error?.name === "ZodError" || Array.isArray(error?.issues)) {
      const issues = error.issues || error.errors || [];
      const message = issues
        .map((i: { path?: (string | number)[]; message?: string }) => {
          const field = Array.isArray(i.path) ? i.path.join(".") : "field";
          return `${field}: ${i.message || "invalid"}`;
        })
        .join("; ");
      return NextResponse.json(
        { error: message || error.message, issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
