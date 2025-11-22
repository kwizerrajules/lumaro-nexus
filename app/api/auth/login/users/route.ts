import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loginSchema } from '@/src/schemas/auth.schema';
import { UsersModel } from '@/src/lib/models/users.model';
import { UserPayload } from '@/src/types/jwt.payload';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';
import { rateLimiter } from '@/src/security/rateLimiter'; // Your in-memory rate limiter
import type { NextRequest } from 'next/server'; 


import bcrypt from 'bcryptjs';
import { use } from 'react';

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
        const user = await UsersModel.getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }
        const { password: passwordHash, ...userData } = user;
        
        const payload: UserPayload = {
            id: user.id ?? '',
            email: user.email,
            role: (user as any).role ?? undefined,
            names: user.names,
            permissions: 'permissions' in user ? (user as any).permissions ?? [] : []
        };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);
        const userDefaulData = {
            id: userData.id,
            names: userData.names,
            email: userData.email,
            phone: userData.phone
        }
        return NextResponse.json({ success: true, data: {
            accessToken,
            refreshToken,
            user: userDefaulData
        } }, { status: 200 });
    }
    catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}   