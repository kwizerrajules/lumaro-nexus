import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryModel } from "@/src/lib/models/category.model";
import { updateCategorySchema } from "@/src/schemas/category.schema";
import { roleMiddleware } from "@/src/middleware/auth";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const parsed = updateCategorySchema.parse(body);
    const updated = await CategoryModel.update(params.id, parsed);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.issues }, { status: 400 });
    }
    const status = err.message === "Category already exists" ? 409 : 500;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update category" },
      { status }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const deleted = await CategoryModel.remove(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
