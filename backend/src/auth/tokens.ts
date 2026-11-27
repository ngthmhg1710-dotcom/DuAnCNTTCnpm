import { sign, verify } from 'jsonwebtoken';

const prod = process.env.NODE_ENV === 'production';
const PLACEHOLDER = /^(change-me|doi-thanh)/i; // giá trị mẫu trong .env.example, không được dùng thật

// Khóa ký token. Production bắt buộc có khóa thật (JWT_SECRET, hoặc tạm OAUTH_SESSION_SECRET); chỉ khi chạy local mới có khóa mặc định.
export function jwtSecret(): string {
  const s = process.env.JWT_SECRET || process.env.OAUTH_SESSION_SECRET;
  if (s && !PLACEHOLDER.test(s)) return s;
  if (prod) throw new Error('Thiếu JWT_SECRET (hoặc đang dùng giá trị mẫu). Đặt một chuỗi ngẫu nhiên dài trong biến môi trường rồi chạy lại.');
  return 'dev-only-jwt-secret';
}
const secret = jwtSecret;
// frontend (Vercel) and API (Render) are different sites, so the cookie must be 'none' in production
const base = { httpOnly: true, secure: prod, sameSite: (prod ? 'none' : 'lax') as 'none' | 'lax' };

export const ACCESS = 'access_token';
export const REFRESH = 'refresh_token';
const ACCESS_TTL = 15 * 60; // seconds
const REFRESH_TTL = 7 * 24 * 60 * 60;

type U = { id: number; username: string; name: string; email: string; role: string };

// tv = User.tokenVersion; logout bumps it, which revokes every issued token.
export function issueAccess(res: any, user: U, tv: number) {
  const { id, username, name, email, role } = user;
  const token = sign({ user: { id, username, name, email, role }, tv, typ: 'access' }, secret(), { expiresIn: ACCESS_TTL });
  res.cookie(ACCESS, token, { ...base, maxAge: ACCESS_TTL * 1000 });
}

export function issueTokens(res: any, user: U, tv: number) {
  issueAccess(res, user, tv);
  const token = sign({ sub: user.id, tv, typ: 'refresh' }, secret(), { expiresIn: REFRESH_TTL });
  // refresh cookie only travels to /api/auth
  res.cookie(REFRESH, token, { ...base, path: '/api/auth', maxAge: REFRESH_TTL * 1000 });
}

export function clearTokens(res: any) {
  res.clearCookie(ACCESS, base);
  res.clearCookie(REFRESH, { ...base, path: '/api/auth' });
}

export function readToken(raw: string | undefined, typ: 'access' | 'refresh'): any {
  if (!raw) return null;
  try {
    const p: any = verify(raw, secret());
    return p.typ === typ ? p : null;
  } catch {
    return null;
  }
}
