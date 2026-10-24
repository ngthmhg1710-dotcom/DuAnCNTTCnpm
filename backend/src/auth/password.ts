import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const hashPw = (pw: string) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
};

export const checkPw = (pw: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(pw, salt, 32));
};
