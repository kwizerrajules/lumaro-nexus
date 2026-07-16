import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { UsersModel } from '@/src/lib/models/users.model';
import { UserPayload } from '@/src/types/jwt.payload';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';
import { rateLimiter } from '@/src/security/rateLimiter';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip;
    const clientIp = ip || 'anonymous';

    if (!rateLimiter(clientIp)) {
        return NextResponse.json(
            { success: false, message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { success: false, message: 'Google sign-in is not configured.' },
            { status: 500 }
        );
    }

    try {
        const { credential } = await request.json();
        if (!credential) {
            return NextResponse.json({ success: false, message: 'Missing Google credential' }, { status: 400 });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const googlePayload = ticket.getPayload();

        if (!googlePayload?.email || !googlePayload.email_verified) {
            return NextResponse.json({ success: false, message: 'Google account email is not verified' }, { status: 401 });
        }

        const email = googlePayload.email;
        const names = googlePayload.name || email.split('@')[0];
        const avatarUrl = googlePayload.picture;

        let user = await UsersModel.getUserByEmail(email);
        if (!user) {
            user = await UsersModel.createGoogleUser({ names, email, avatarUrl });
        }

        const payload: UserPayload = {
            id: user.id ?? '',
            email: user.email,
            role: (user as any).role || 'USER',
            names: user.names,
            permissions: 'permissions' in user ? (user as any).permissions ?? [] : [],
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        const userDefaulData = {
            id: user.id,
            names: user.names,
            email: user.email,
            phone: (user as any).phone,
        };

        return NextResponse.json({
            success: true,
            data: { accessToken, refreshToken, user: userDefaulData },
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error?.message || 'Google sign-in failed' },
            { status: 401 }
        );
    }
}
