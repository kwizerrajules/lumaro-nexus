// this is the authentication middleware
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/src/security/auth';
import { StaffPayload } from '@/src/types/jwt.payload';


// middleware to authenticate requests


export async function authMiddleware(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, message: 'Unauthorized or token has expired' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token) as StaffPayload | null;
    if (!payload) {
        return NextResponse.json({ success: false, message: 'Unauthorized or token has expired' }, { status: 401 });
    }


    request.nextUrl.searchParams.set('userId', payload.id);
    request.nextUrl.searchParams.set('role', payload.role);
    if (payload.permissions) {
        request.nextUrl.searchParams.set('permissions', JSON.stringify(payload.permissions));
    }

    return payload;
}

// middleware to check for specific roles

export async function roleMiddleware(req: NextRequest, requiredRoles: string[]) {
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult;
    
    if (!requiredRoles.includes(user.role)) {
        return NextResponse.json({ error: "Forbidden: Insufficient role" }, { status: 403 });
    }

    return { user };
}



// middleware to check for specific permissions


export async function permissionMiddleware(req: NextRequest, requiredPermissions: string[]) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const userPermissions: string[] = Array.isArray(user.permissions)
    ? (user.permissions as string[])
    : typeof user.permissions === "string"
    ? (user.permissions as string).split(",").map((p) => p.trim())
    : [];


  if (userPermissions.includes("*")) return { user };

  const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  return { user };
}