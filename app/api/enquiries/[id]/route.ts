import { NextResponse, NextRequest } from 'next/server';
import { verifyAccessToken } from '@/src/security/auth';
import { EnquiriesModel } from '@/src/lib/models/enquiry.model';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const user = verifyAccessToken(token);
  if (!user?.id)
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const updates = await req.json();
  const updated = await EnquiriesModel.updateEnquiry(id, user.id, updates);

  if (!updated)
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

  return NextResponse.json(updated, { status: 200 });
}



export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const {id} = await context.params;

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.split(' ')[1];
  const user = verifyAccessToken(token);
  if (!user?.id) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

  const deleted = await EnquiriesModel.deleteEnquiry(id, user.id);
  if (!deleted) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
  return NextResponse.json({ success: true }, { status: 200 });
}

