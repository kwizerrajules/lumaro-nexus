import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "../../../../src/lib/models/houseProject.model";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const project = await HouseProjectModel.getById(id);

  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(project, { status: 200 });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const {id} = await context.params;

  try {
    // const { id } = await params;
    const data = await req.json();
    await HouseProjectModel.update(id, data);
    const updated = await HouseProjectModel.getById(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await HouseProjectModel.delete(id);

  return NextResponse.json({ message: "Project deleted" }, { status: 200 });
}