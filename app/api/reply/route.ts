// this is the endpoint to reply to eveyr thing
import { NextResponse, NextRequest } from 'next/server';
import { ReplyMethods } from '@/src/utils/reply.methods';
// protect this route
import { permissionMiddleware } from '@/src/middleware/auth';

export async function POST(request: Request) {
    const req: NextRequest = request as NextRequest;
    const permissionCheck = await permissionMiddleware(req, ['REPLY_MESSAGES']);
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    try {
        const body = await request.json();
        const { to, from, messageId, messegeSubject, replyMessage } = body;
        
        await ReplyMethods.replyForContact({
            to,
            from,
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
