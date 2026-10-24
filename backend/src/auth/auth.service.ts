import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { checkPw, hashPw } from './password';

@Injectable()
export class AuthService {
  async getAllUsers() {
    const users = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return users.map(({ passwordHash, tokenVersion, ...u }) => u);
  }

  // STAFF may only manage STUDENT accounts; ADMIN manages all.
  private async editable(actor: any, id: number) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new BadRequestException('Không tìm thấy tài khoản');
    if (actor.role !== 'ADMIN' && target.role !== 'STUDENT') throw new ForbiddenException('Không đủ quyền');
    return target;
  }

  async createUser(actor: any, b: any) {
    const role = actor.role === 'ADMIN' && b.role ? b.role : 'STUDENT';
    const username = String(b.username || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    if (!username || !email || !b.name) throw new BadRequestException('Thiếu username, họ tên hoặc email');
    try {
      const user = await this.prisma.user.create({ data: { username, email, name: b.name, role, passwordHash: b.password ? hashPw(String(b.password)) : null } });
      await this.ensureStudent(user);
      const { passwordHash, ...safe } = user;
      return safe;
    } catch {
      throw new BadRequestException('Username hoặc email đã tồn tại');
    }
  }

  async updateUser(actor: any, id: number, b: any) {
    await this.editable(actor, id);
    if (actor.id === id && b.status === 'INACTIVE') throw new BadRequestException('Không thể tự khóa tài khoản của mình');
    const data: any = { name: b.name, email: b.email?.trim().toLowerCase(), status: b.status };
    if (actor.role === 'ADMIN' && b.role) data.role = b.role;
    if (b.password) data.passwordHash = hashPw(String(b.password));
    try {
      const { passwordHash, ...safe } = await this.prisma.user.update({ where: { id }, data });
      return safe;
    } catch {
      throw new BadRequestException('Email đã tồn tại');
    }
  }

  async deleteUser(actor: any, id: number) {
    if (actor.id === id) throw new BadRequestException('Không thể tự xóa tài khoản của mình');
    await this.editable(actor, id);
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Tài khoản đã có dữ liệu liên quan, hãy khóa thay vì xóa');
    }
    return { success: true };
  }

  constructor(private readonly prisma: PrismaService) {}

  // Student accounts need a Student row, otherwise they never show up for staff
  // and cannot register for activities or submit declarations.
  private async ensureStudent(user: any) {
    if (!user || user.role !== 'STUDENT' || typeof user.id !== 'number') return;
    try {
      await this.prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, mssv: String(user.username).toUpperCase() },
      });
    } catch (e) {
      // DB offline or mssv clash: ignore, login must still work
    }
  }

  async loginWithCredentials(username: string, password?: string) {
    const cleanUsername = username.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: { equals: cleanUsername, mode: 'insensitive' } }, { email: cleanUsername }] },
    });

    // Mọi vai trò đều phải có mật khẩu; tài khoản chưa có mật khẩu chỉ vào được bằng Google OAuth.
    if (!user?.passwordHash || !password || !checkPw(password, user.passwordHash)) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc không hoạt động.');
    }

    await this.ensureStudent(user);
    return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role };
  }

  // Chỉ gọi với email đã được Google xác thực (ID token hoặc OAuth callback).
  async loginWithGoogle(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@tdtu.edu.vn') && !cleanEmail.endsWith('@student.tdtu.edu.vn')) {
      throw new UnauthorizedException('Hệ thống chỉ cho phép đăng nhập bằng email trường TDTU (@tdtu.edu.vn hoặc @student.tdtu.edu.vn).');
    }

    // Chỉ cho vào tài khoản đã có trong DB (import hoặc admin tạo), không tự tạo tài khoản mới.
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) throw new UnauthorizedException('Email chưa có trong hệ thống. Vui lòng liên hệ quản trị viên.');

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc không hoạt động.');
    }

    await this.ensureStudent(user);
    return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role };
  }

  async verifyGoogleIdToken(idToken: string) {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!res.ok) {
        throw new UnauthorizedException('Google ID Token không hợp lệ hoặc đã hết hạn.');
      }
      const payload = await res.json();
      if (payload.aud !== process.env.OAUTH_GOOGLE_CLIENT_ID) {
        throw new UnauthorizedException('Google ID Token không dành cho ứng dụng này.');
      }
      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        throw new UnauthorizedException('Email Google chưa được xác thực.');
      }

      return this.loginWithGoogle(payload.email);
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Xác thực Google OAuth 2.0 thất bại.');
    }
  }

  async findOrLinkOAuthUser(input: { provider: string; subject: string; email: string; name: string }) {
    let user: any = null;
    try {
      user = await this.prisma.user.findUnique({ where: { email: input.email } });
    } catch (e) {
      // Database connection offline
    }

    if (!user) {
      return this.loginWithGoogle(input.email);
    }

    if (user.status && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc không hoạt động.');
    }

    if (user.oauthProvider !== input.provider || user.oauthSubject !== input.subject) {
      try {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { oauthProvider: input.provider, oauthSubject: input.subject },
        });
      } catch (e) {
        // Ignore update error in dev
      }
    }

    await this.ensureStudent(user);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async tokenVersion(id: number) {
    try {
      return (await this.prisma.user.findUnique({ where: { id }, select: { tokenVersion: true } }))?.tokenVersion ?? 0;
    } catch {
      return 0;
    }
  }

  async activeUser(id: number, tv: number) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u || u.status !== 'ACTIVE' || u.tokenVersion !== tv) return null;
    return { id: u.id, username: u.username, name: u.name, email: u.email, role: u.role };
  }

  async revokeTokens(id: number, tv: number) {
    // chỉ hủy nếu token còn là phiên hiện hành (tránh token cũ đã hết hiệu lực đá phiên mới)
    await this.prisma.user.updateMany({ where: { id, tokenVersion: tv }, data: { tokenVersion: { increment: 1 } } }).catch(() => null);
  }

  async me(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('Tài khoản không còn tồn tại.');
    return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role };
  }
}
