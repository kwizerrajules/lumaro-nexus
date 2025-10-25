import { NextRequest, NextResponse } from "next/server";
import { handleSecureFile } from "@/app/security/fileSecurity";
import { HouseProjectModel } from "@/app/lib/models/houseProject.model";
import { HouseProject } from "@/app/schemas/house.projects.schema";

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

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body
    const body = await req.json();

    // Expect base64 strings for files
    const thumbnailBase64 = body.thumbnailBase64 as string | undefined;
    const additionalImagesBase64 = body.additionalImagesBase64 as string[] | undefined;

    // Save files using file security utility
    let thumbnailUrl: string | undefined;
    if (thumbnailBase64) {
      thumbnailUrl = await handleSecureFile({ base64: thumbnailBase64 });
    }

    let additionalImages: string[] = [];
    if (additionalImagesBase64 && additionalImagesBase64.length > 0) {
      additionalImages = await Promise.all(
        additionalImagesBase64.map((b64) => handleSecureFile({ base64: b64 }))
      );
    }

    // Merge fields with file URLs
    const now = new Date().toISOString();
    const data: HouseProject = {
      id: undefined as any, // will be auto-generated in model
      title: body.title,
      description: body.description,
      thumbnail: thumbnailUrl!,
      additionalImages,
      status: body.status || "planned",
      rooms: body.rooms ? Number(body.rooms) : 0,
      height: body.height ? Number(body.height) : undefined,
      width: body.width ? Number(body.width) : undefined,
      areaSqFt: body.areaSqFt ? Number(body.areaSqFt) : undefined,
      location: body.location,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
      floors: body.floors ? Number(body.floors) : undefined,
      categoty: body.categoty,
      style: body.style,
      price: body.price ? Number(body.price) : undefined,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Create project in DB
    const project = await HouseProjectModel.create(data);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
