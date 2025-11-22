import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

if (!ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET is not defined in .env');
if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not defined in .env');

export function createAccessToken(payload: { id: string; role: string, names: string,  permissions?: string[] }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '2h' });
}

export function createRefreshToken(payload: { id: string; role: string, names: string,  permissions?: string[] }) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { id: string; role: string, names:string, permissions?: string[] };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string; role: string, names: string,  permissions?: string[] };
  } catch {
    return null;
  }
}

