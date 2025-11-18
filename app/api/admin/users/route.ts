import { NextResponse, NextRequest } from "next/server";
import { UsersModel } from "@/src/lib/models/users.model";
import { roleMiddleware } from "@/src/middleware/auth";

export async function GET(req: NextRequest) {
    const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE"])
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    try {
        const users = await UsersModel.getAllUsers();
        return NextResponse.json(users, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}   

