import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserSchema } from '../../../../../src/schemas/users.schema';
import { UsersModel } from '../../../../../src/lib/models/users.model';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedData = createUserSchema.parse(body);
        const {...restData } = parsedData;
        const userData = { id: uuidv4(), ...restData };
        const newUser = await UsersModel.createUser(userData);
        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    }
    catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}