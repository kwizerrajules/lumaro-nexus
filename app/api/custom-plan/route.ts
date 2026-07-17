import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/src/security/auth";
import { CustomPlanModel } from "@/src/lib/models/cutomPLan.model";
import { verifyTurnstileToken } from "@/src/lib/turnstile";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyAccessToken(token);

    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();
    const { turnstileToken, ...planFields } = body;

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (turnstile.ok === false) {
      return NextResponse.json({ error: turnstile.message }, { status: 400 });
    }

    const plan = await CustomPlanModel.create({
      ...planFields,
      user_id: user.id,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyAccessToken(token);

    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const plans = await CustomPlanModel.getAllByUser(user.id);

    return NextResponse.json(plans);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

