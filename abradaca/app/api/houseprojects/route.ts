import { NextRequest, NextResponse } from "next/server";
import { handleSecureFile } from "@/app/security/fileSecurity";
import { HouseProjectModel } from "@/app/lib/models/houseProject.model";
import { HouseProjectImagesModel } from "@/app/lib/models/houseProjectImages.models";
import { HouseProject } from "@/app/schemas/house.projects.schema";
import { v4 as uuidv4 } from "uuid";
import { sanitizeEverything } from "@/app/security/sanitizeEverything";

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
    const rawBody = await req.json();
    const body = sanitizeEverything(rawBody);

    const thumbnailBase64 = body.thumbnailBase64 as string | undefined;
    const additionalImagesBase64 = body.additionalImagesBase64 as string[] | undefined;

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

    const now = new Date().toISOString();

    const data: HouseProject = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      thumbnail: thumbnailUrl || "",
      additionalImages,
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
      price: Number(body.price) || 0,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };


    const project = await HouseProjectModel.create(data);

    // 2Save images into DB (as BLOBs)
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

    if (additionalImagesBase64 && additionalImagesBase64.length > 0) {
      for (let i = 0; i < additionalImagesBase64.length; i++) {
        const buffer = Buffer.from(additionalImagesBase64[i], "base64");
        await HouseProjectImagesModel.insertImage({
          id: uuidv4(),
          houseproject_id: project.id,
          type: "additional",
          image: buffer,
          filename: `image_${i + 1}.jpg`,
        });
      }
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
