import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loginSchema } from '../../../../../src/schemas/auth.schema';
import { UsersModel } from '../../../../../src/lib/models/users.model';
import { UserPayload } from '../../../../../src/types/jwt.payload';
import { createAccessToken, createRefreshToken } from '../../../../../src/security/auth';

import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
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
        const { passwordHash, ...userData } = user;
        
        const payload: UserPayload = {
            id: user.id ?? '',
            email: user.email,
            role: user.role,
        };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);
        return NextResponse.json({ success: true, data: {
            accessToken,
            refreshToken,
            user: userData
        } }, { status: 200 });
    }
    catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}   