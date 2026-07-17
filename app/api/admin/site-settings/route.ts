import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { roleMiddleware } from '@/src/middleware/auth';
import { SiteSettingsModel } from '@/src/lib/models/siteSettings.model';
import {
  siteSettingsSchema,
  updateSiteSettingsSchema,
} from '@/src/schemas/siteSettings.schema';

const STAFF = ['ADMIN', 'EXECUTIVE', 'SUPER_ADMIN', 'MANAGER'];

export async function GET(req: NextRequest) {
  const auth = await roleMiddleware(req, STAFF);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await SiteSettingsModel.get();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await roleMiddleware(req, STAFF);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = siteSettingsSchema.parse(body);
    const settings = await SiteSettingsModel.update(parsed);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await roleMiddleware(req, STAFF);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = updateSiteSettingsSchema.parse(body);
    const settings = await SiteSettingsModel.update(parsed);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

/** Reset to original seeded brand defaults. */
export async function DELETE(req: NextRequest) {
  const auth = await roleMiddleware(req, STAFF);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await SiteSettingsModel.reset();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reset settings' },
      { status: 500 }
    );
  }
}
