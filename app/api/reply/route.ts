// this is the endpoint to reply to eveyr thing
import { NextResponse } from 'next/server';
import { ReplyMethods } from '@/src/utils/reply.methods';

export async function POST(request: Request) {
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
