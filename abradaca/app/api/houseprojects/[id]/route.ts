import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "@/app/lib/models/houseProject.model";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const project = await HouseProjectModel.getById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await req.json(); // only include fields to update
    await HouseProjectModel.update(id, data);
    const updated = await HouseProjectModel.getById(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  await HouseProjectModel.delete(id);
  return NextResponse.json({ message: "Project deleted" });
}
