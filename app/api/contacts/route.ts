import { NextRequest, NextResponse } from "next/server";
import { ContactUsModel } from "@/src/lib/models/contactUs.model";
import { roleMiddleware } from "@/src/middleware/auth";
import { verifyTurnstileToken } from "@/src/lib/turnstile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { names, email, phone, message, turnstileToken } = body;

    if (!names || !email || !message) {
      return NextResponse.json(
        { error: "Names, email, and message are required." },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.message }, { status: 400 });
    }

    await ContactUsModel.insertContactUs({ names, email, phone, message });
    return NextResponse.json(
      { message: "Contact message submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling contact us request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/** List contacts — staff only (PII). Prefer /api/admin/contact_us. */
export async function GET(req: NextRequest) {
  const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE", "SUPER_ADMIN", "MANAGER"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const contacts = await ContactUsModel.getAllContacts();
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error while fetching contacts", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
