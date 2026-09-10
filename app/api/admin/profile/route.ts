import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/src/middleware/auth';
import { StaffModel } from '@/src/lib/models/staff.model';
import { updateStaffProfileSchema } from '@/src/schemas/staff.schema';
import { createAccessToken, createRefreshToken } from '@/src/security/auth';

export async function GET(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const currentStaff = authResult; // StaffPayload

  try {
    const staff = await StaffModel.getStaffByIdOrEmail(currentStaff.id, currentStaff.email);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    const { passwordHash, ...profileData } = staff;
    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const currentStaff = authResult;

  try {
    const body = await req.json();
    const parsedData = updateStaffProfileSchema.parse(body);

    const updated = await StaffModel.updateStaffProfile(
      currentStaff.id,
      currentStaff.email,
      parsedData
    );

    // Issue updated tokens with the new profile info (names, email, role, permissions)
    const newPayload = {
      id: updated.id || currentStaff.id,
      email: updated.email,
      role: updated.role,
      names: updated.names,
      permissions: updated.permissions,
    };

    const accessToken = createAccessToken(newPayload);
    const refreshToken = createRefreshToken(newPayload);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        staff: updated,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 400 }
    );
  }
}
