// endoint to register a staff member
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createStaffSchema } from '@/src/schemas/staff.schema';
import { StaffModel } from '@/src/lib/models/staff.model';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedData = createStaffSchema.parse(body);
        // Generate a UUID for the new staff member
        const staffData = { id: uuidv4(), ...parsedData };
        const newStaff = await StaffModel.createStaff(staffData);
        return NextResponse.json({ success: true, data: newStaff }, { status: 201 });
    }
    catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
