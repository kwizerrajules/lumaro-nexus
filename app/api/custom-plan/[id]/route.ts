import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/src/security/auth";
import { CustomPlanModel } from "@/src/lib/models/cutomPLan.model";


export async function GET(_, { params }: any) {
  const { id } = params;

  try {
    const plan = await CustomPlanModel.getById(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}



export async function PUT(req: Request, { params }: any) {
  const { id } = params;

  try {
    const body = await req.json();
    const updated = await CustomPlanModel.update(id, body);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


export async function DELETE(_, { params }: any) {
  const { id } = params;

  try {
    const deleted = await CustomPlanModel.delete(id);
    return NextResponse.json(deleted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
