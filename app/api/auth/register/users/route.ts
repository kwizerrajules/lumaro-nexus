import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserSchema } from '../../../../../src/schemas/users.schema';
import { UsersModel } from '../../../../../src/lib/models/users.model';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';
import { UserPayload } from '@/src/types/jwt.payload';
import { verifyTurnstileToken } from '@/src/lib/turnstile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null;

    const turnstile = await verifyTurnstileToken(body.turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json(
        { success: false, message: turnstile.message },
        { status: 400 }
      );
    }

    const parsedData = createUserSchema.parse({
      names: body.names,
      email: body.email,
      phone: body.phone || undefined,
      password: body.password,
    });

    const newUser = await UsersModel.createUser(parsedData);

    const payload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      role: 'USER',
      names: newUser.names,
      permissions: [],
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: newUser.id,
            names: newUser.names,
            email: newUser.email,
            phone: newUser.phone,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const conflict =
      error.message === 'Email already in use' ||
      error.message === 'Phone number already in use' ||
      error.message === 'Account already exists';
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: conflict ? 409 : 500 }
    );
  }
}
