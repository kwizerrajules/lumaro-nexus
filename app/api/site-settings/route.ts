import { NextRequest, NextResponse } from 'next/server';
import { SiteSettingsModel } from '@/src/lib/models/siteSettings.model';

/** Public — footer / contact section. Seeds defaults on first read. */
export async function GET() {
  try {
    const settings = await SiteSettingsModel.get();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('GET /api/site-settings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}
