import { NextResponse } from "next/server";

export async function GET(params: NextResponse) {
    return NextResponse.json({message: "Welcome home DUDE"})
}