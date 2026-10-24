import { sign, verify } from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || process.env.OAUTH_SESSION_SECRET || 'change-me-jwt-secret';
const prod = process.env.NODE_ENV === 'production';
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
