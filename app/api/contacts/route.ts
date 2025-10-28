import { NextResponse } from "next/server";
import { ContactUsModel } from "@/src/lib/models/contactUs.model";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { names, email, phone, message } = body;
        
        if (!names || !email || !message) {
            return NextResponse.json({ error: "Names, email, and message are required." }, { status: 400 });
        }
        
        await ContactUsModel.insertContactUs({ names, email, phone, message });
        return NextResponse.json({ message: "Contact message submitted successfully." }, { status: 201 });
    }
    catch (error) {
        console.error("Error handling contact us request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
