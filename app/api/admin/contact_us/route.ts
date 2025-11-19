import { NextResponse, NextRequest } from "next/server";
import { roleMiddleware } from "@/src/middleware/auth";
import { ContactUsModel } from "@/src/lib/models/contactUs.model";



export async function GET(req: NextRequest) {
    const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE"])
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    try {
        const contacts = await ContactUsModel.getAllContacts();
        return NextResponse.json(contacts, { status: 200 });
        } catch (err: any) {
        console.error(err);
        return NextResponse
        .json({ error: err.message }, { status: 400 });
        }
}