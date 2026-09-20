import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { StaffModel } from '@/src/lib/models/staff.model';
import { StaffPayload } from '@/src/types/jwt.payload';
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

        const staff = await StaffModel.getStaffByEmail(googlePayload.email);
        if (!staff) {
            // Admins are never auto-provisioned via Google sign-in.
            return NextResponse.json(
                { success: false, message: `The Google account (${googlePayload.email}) is not authorized to access the admin panel.` },
                { status: 403 }
            );
        }

        const { passwordHash, ...staffData } = staff;

        const payload: StaffPayload = {
            id: staff.id ?? '',
            email: staff.email,
            role: staff.role,
            names: staff.names,
            permissions: staff.permissions,
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return NextResponse.json({
            success: true,
            data: { accessToken, refreshToken, staff: staffData },
        }, { status: 200 });
    } catch (error: any) {
        console.error('Google Admin Sign-In Error:', error?.message || error);
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
