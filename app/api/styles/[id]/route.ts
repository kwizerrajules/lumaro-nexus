import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StyleModel } from "@/src/lib/models/style.model";
import { updateStyleSchema } from "@/src/schemas/style.schema";
import { roleMiddleware } from "@/src/middleware/auth";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const authResult = await roleMiddleware(req, [
    "ADMIN",
    "EXECUTIVE",
    "SUPER_ADMIN",
    "MANAGER",
  ]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const parsed = updateStyleSchema.parse(body);
    const updated = await StyleModel.update(params.id, parsed);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Style not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.issues }, { status: 400 });
    }
    const known =
      err.message === "Parent category not found" ||
      err.message === "Style already exists under this category";
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update style" },
      { status: known ? 400 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await roleMiddleware(req, [
    "ADMIN",
    "EXECUTIVE",
    "SUPER_ADMIN",
    "MANAGER",
  ]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const deleted = await StyleModel.remove(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Style not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete style" },
      { status: 500 }
    );
  }
}
