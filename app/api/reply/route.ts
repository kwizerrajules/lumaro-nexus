import { NextResponse, NextRequest } from 'next/server';
import { ReplyMethods } from '../../../src/utils/reply.methods';
// protect this route
import { permissionMiddleware, roleMiddleware } from '../../../src/middleware/auth';
const EMAIL_USER = process.env.EMAIL_HOST_USER || '';

export async function POST(request: Request) {
    const req: NextRequest = request as NextRequest;
    const permissionCheck = await permissionMiddleware(req, ['REPLY_MESSAGES']);
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    try {
        const body = await request.json();
        const { to, from, messageId, messegeSubject, replyMessage } = body;
        
        await ReplyMethods.replyForContact({
            to,
            from: EMAIL_USER,
            messageId,
            messegeSubject,
            replyMessage
        });
        
        return NextResponse.json({ message: "Reply sent successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("Error sending reply:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
