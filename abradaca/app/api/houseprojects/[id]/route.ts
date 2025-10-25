import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "@/app/lib/models/houseProject.model";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await HouseProjectModel.getById(params.id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    await HouseProjectModel.update(params.id, data);
    const updated = await HouseProjectModel.getById(params.id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await HouseProjectModel.delete(params.id);
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
