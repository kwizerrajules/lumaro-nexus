import { NextRequest, NextResponse } from "next/server";
import { handleSecureFile } from "../../..//src/security/fileSecurity";
import { HouseProjectModel } from "../../../src/lib/models/houseProject.model";
import { HouseProjectImagesModel } from "../../../src/lib/models/houseProjectImages.models";
import { HouseProject } from "../../../src/schemas/house.projects.schema";
import { v4 as uuidv4 } from "uuid";
import { sanitizeEverything } from "../../../src/security/sanitizeEverything";
import pool from "../../../src/lib/db";


let cachedTypes: string[] = [];
let cacheTime = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status") || undefined;
    const categoty = searchParams.get("categoty") || undefined;
    const style = searchParams.get("style") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await HouseProjectModel.getAll({
      limit,
      offset,
      status,
      categoty,
      style,
      search,
    });

    // Optional: cache all types for filter dropdowns (refresh every 5 mins)
    if (!cachedTypes.length || Date.now() - cacheTime > 5 * 60 * 1000) {
      const allProjects = await HouseProjectModel.getAll({ limit: 10000, offset: 0 });
      cachedTypes = Array.from(new Set(allProjects.data.map(p => p.type).filter(Boolean)));
      cacheTime = Date.now();
    }

    return NextResponse.json({ ...result, types: cachedTypes });
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const rawBody = await req.json();
    const body = sanitizeEverything(rawBody);

    const thumbnailBase64 = body.thumbnailBase64 as string | undefined;
    const additionalImagesBase64 = body.additionalImagesBase64 as string[] | undefined;

    let thumbnailUrl: string | undefined;
    if (thumbnailBase64) {
      thumbnailUrl = await handleSecureFile({ base64: thumbnailBase64 });
    }

    const now = new Date().toISOString();
    const projectData = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      thumbnail: thumbnailUrl || "",
      additionalImages: additionalImagesBase64 || [],
      status: body.status || "planned",
      rooms: Number(body.rooms) || 0,
      height: Number(body.height) || 0,
      width: Number(body.width) || 0,
      areaSqFt: Number(body.areaSqFt) || 0,
      location: body.location || "",
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      floors: Number(body.floors) || 0,
      categoty: body.categoty || "",
      style: body.style || "",
      type: body.type || "",
      price: Number(body.price) || 0,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Use a single connection and transaction for all inserts
    await conn.beginTransaction();

    const project = await HouseProjectModel.create(projectData);

    // Save thumbnail (if exists)
    if (thumbnailBase64) {
      const buffer = Buffer.from(thumbnailBase64, "base64");
      await HouseProjectImagesModel.insertImage({
        id: uuidv4(),
        houseproject_id: project.id,
        type: "thumbnail",
        image: buffer,
        filename: project.thumbnail.split("/").pop() || "thumbnail.jpg",
      });
    }

    // Save additional images in parallel
    if (additionalImagesBase64 && additionalImagesBase64.length > 0) {
      await Promise.all(
        additionalImagesBase64.map((b64, i) => {
          const buffer = Buffer.from(b64, "base64");
          return HouseProjectImagesModel.insertImage({
            id: uuidv4(),
            houseproject_id: project.id,
            type: "additional",
            image: buffer,
            filename: `image_${i + 1}.jpg`,
          });
        })
      );
    }

    await conn.commit();
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    await conn.rollback();
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    conn.release();
  }
}
