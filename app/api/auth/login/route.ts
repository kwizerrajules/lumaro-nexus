import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loginSchema } from '@/src/schemas/auth.schema';
import { StaffModel } from '@/src/lib/models/staff.model';
import { StaffPayload } from '@/src/types/jwt.payload';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';
import { rateLimiter } from '@/src/security/rateLimiter'; // Your in-memory rate limiter
import bcrypt from 'bcryptjs';

import type { NextRequest } from 'next/server'; 

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip;
    
    const clientIp = ip || 'anonymous'; 

    if (!rateLimiter(clientIp)) {
        return NextResponse.json(
            { success: false, message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const parsedData = loginSchema.parse(body);

        const { email, password } = parsedData;
        
        const staff = await StaffModel.getStaffByEmail(email);  
        if (!staff) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }
        
        const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
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

        return NextResponse.json({ success: true, data: {
            accessToken,
            refreshToken,
            staff: staffData
        } }, { status: 200 });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}