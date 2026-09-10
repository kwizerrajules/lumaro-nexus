import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/src/middleware/auth';
import { StaffModel } from '@/src/lib/models/staff.model';
import { changeStaffPasswordSchema } from '@/src/schemas/staff.schema';

export async function POST(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const currentStaff = authResult; // StaffPayload

  try {
    const body = await req.json();
    const parsedData = changeStaffPasswordSchema.parse(body);

    await StaffModel.updateStaffPassword(
      currentStaff.id,
      currentStaff.email,
      parsedData.currentPassword,
      parsedData.newPassword
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Error changing admin password:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
