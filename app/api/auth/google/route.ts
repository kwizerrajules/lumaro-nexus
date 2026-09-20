import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { UsersModel } from '@/src/lib/models/users.model';
import { UserPayload } from '@/src/types/jwt.payload';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';
import { rateLimiter } from '@/src/security/rateLimiter';

const allowedAudiences = Array.from(
    new Set(
        [
            process.env.GOOGLE_CLIENT_ID,
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        ]
            .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
            .map((id) => id.trim().replace(/^['"]|['"]$/g, ''))
    )
);

const client = new OAuth2Client();

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip;
    const clientIp = ip || 'anonymous';

    if (!rateLimiter(clientIp)) {
        return NextResponse.json(
            { success: false, message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    if (allowedAudiences.length === 0) {
        return NextResponse.json(
            { success: false, message: 'Google sign-in is not configured on this server.' },
            { status: 500 }
        );
    }

    let rawCredential = '';
    try {
        const { credential } = await request.json();
        if (!credential) {
            return NextResponse.json({ success: false, message: 'Missing Google credential' }, { status: 400 });
        }
        rawCredential = credential;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: allowedAudiences.length === 1 ? allowedAudiences[0] : allowedAudiences,
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
        console.error('Google User Sign-In Error:', error?.message || error);
        let userMessage = error?.message || 'Google sign-in failed';

        if (
            error?.message?.includes('audience != requiredAudience') ||
            error?.message?.includes('Wrong recipient')
        ) {
            try {
                const parts = rawCredential.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                    console.error('Google Audience Mismatch:', {
                        tokenAudience: payload?.aud,
                        allowedAudiences,
                    });
                }
            } catch {}

            userMessage =
                'Google sign-in configuration mismatch. Please sign in with email and password, or check server GOOGLE_CLIENT_ID settings.';
        }

        return NextResponse.json(
            { success: false, message: userMessage },
            { status: 401 }
        );
    }
}
