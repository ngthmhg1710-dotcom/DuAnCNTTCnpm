import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly auth: AuthService) {
    super({
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
      callbackURL: (process.env.OAUTH_GOOGLE_CALLBACK_URL && !process.env.OAUTH_GOOGLE_CALLBACK_URL.includes('localhost'))
        ? process.env.OAUTH_GOOGLE_CALLBACK_URL
        : 'https://student-activity-api-w982.onrender.com/api/auth/oauth/google/callback',
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) throw new UnauthorizedException('OAuth provider không trả về email.');

    if (!email.endsWith('@tdtu.edu.vn') && !email.endsWith('@student.tdtu.edu.vn')) {
      throw new UnauthorizedException('Hệ thống chỉ cho phép đăng nhập bằng email trường TDTU (@tdtu.edu.vn hoặc @student.tdtu.edu.vn).');
    }

    const realName = profile.displayName || (profile as any)._json?.name || email;
    return this.auth.findOrLinkOAuthUser({
      provider: 'google',
      subject: profile.id,
      email,
      name: realName,
    });
  }

}
