import { NextResponse } from "next/server";
import { ContactUsModel } from "@/src/lib/models/contactUs.model";
import { success } from "zod";

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

// nothing 

export async function GET() {
    try {
        
        const contacts = await ContactUsModel.getAllContacts();
        return NextResponse.json({success: true, data: "Nothing"})

    } catch( error ){
        console.error("Error while fetching contacts us people", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}
