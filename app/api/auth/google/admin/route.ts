import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { StaffModel } from '@/src/lib/models/staff.model';
import { StaffPayload } from '@/src/types/jwt.payload';
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

        const staff = await StaffModel.getStaffByEmail(googlePayload.email);
        if (!staff) {
            // Admins are never auto-provisioned via Google sign-in.
            return NextResponse.json(
                { success: false, message: 'This Google account is not authorized to access the admin panel.' },
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
        return NextResponse.json(
            { success: false, message: error?.message || 'Google sign-in failed' },
            { status: 401 }
        );
    }
}
