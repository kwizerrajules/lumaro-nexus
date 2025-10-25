import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "@/app/lib/models/houseProject.model";

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
    const data = await req.json();
    const project = await HouseProjectModel.create(data);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
