import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryModel } from "@/src/lib/models/category.model";
import { createCategorySchema } from "@/src/schemas/category.schema";
import { roleMiddleware } from "@/src/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const categories = await CategoryModel.list(search);
    return NextResponse.json(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to list categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const parsed = createCategorySchema.parse(body);
    const category = await CategoryModel.create(parsed);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.issues }, { status: 400 });
    }
    const status = err.message === "Category already exists" ? 409 : 500;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create category" },
      { status }
    );
  }
}
