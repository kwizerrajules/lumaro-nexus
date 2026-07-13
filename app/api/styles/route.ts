import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StyleModel } from "@/src/lib/models/style.model";
import { createStyleSchema } from "@/src/schemas/style.schema";
import { roleMiddleware } from "@/src/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
    const categoryName = req.nextUrl.searchParams.get("category") || undefined;

    const styles = await StyleModel.list({ search, categoryId, categoryName });
    return NextResponse.json(
      { success: true, data: styles },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to list styles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await roleMiddleware(req, [
    "ADMIN",
    "EXECUTIVE",
    "SUPER_ADMIN",
    "MANAGER",
  ]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const parsed = createStyleSchema.parse(body);
    const style = await StyleModel.create(parsed);
    return NextResponse.json({ success: true, data: style }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.issues }, { status: 400 });
    }
    const known =
      err.message === "Parent category not found" ||
      err.message === "Style already exists under this category";
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create style" },
      { status: known ? 400 : 500 }
    );
  }
}
