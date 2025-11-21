import { EnquiriesModel } from "@/src/lib/models/enquiry.model";
import { NextResponse, NextRequest } from "next/server";
import { roleMiddleware } from "@/src/middleware/auth";

const enquiriesModel = new EnquiriesModel();


export async function GET(req: NextRequest) {
    const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE"]);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    try {
        const enquiries = await enquiriesModel.getAllEnquiries();
        return NextResponse.json(enquiries, { status: 200 });
        } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 400 });  
        }
}
