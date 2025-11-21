import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/src/security/auth';
import { EnquiriesModel } from '@/src/lib/models/enquiry.model';

const enquiriesModel = new EnquiriesModel();

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyAccessToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const data = await req.json();
    const enquiry = await enquiriesModel.createEnquiry(data, user.id);

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// Get all enquiries made by the authenticated user

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyAccessToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const enquiries = await enquiriesModel.getUserEnquiries(user.id);
    return NextResponse.json(enquiries, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

