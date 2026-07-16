import { NextRequest, NextResponse } from "next/server";
import { HouseProjectModel } from "../../../../src/lib/models/houseProject.model";
import { roleMiddleware } from "@/src/middleware/auth";

const STAFF_ROLES = ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"];

/** Public + admin: resolve by SEO slug or Mongo `_id`. */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const project = await HouseProjectModel.getBySlugOrId(id);

  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(project, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await roleMiddleware(req, STAFF_ROLES);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    const data = await req.json();
    await HouseProjectModel.update(id, data);
    const updated = await HouseProjectModel.getBySlugOrId(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await roleMiddleware(req, STAFF_ROLES);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    await HouseProjectModel.delete(id);
    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
