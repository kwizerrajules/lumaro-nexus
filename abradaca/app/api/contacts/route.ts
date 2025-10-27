import { NextResponse, NextRequest } from "next/server";
import { ContactUsModel } from "@/app/lib/models/contacts.model";
import { ZodEmail } from "zod";
// import ContactUs from "@/utils/interfaces";


type ContactUs = {
    id: string,
    names: string,
    email: ZodEmail,
    phone?: string,
    message: string
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const data: ContactUs = {
            id:
        }
        const saveContact = await ContactUsModel.createCOntact(data)
    } catch (err: any) {
        return NextResponse.json({error: err.message})
    }
}