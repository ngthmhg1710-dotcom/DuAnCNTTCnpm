import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const hashPw = (pw: string) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
};
const checkPw = (pw: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(pw, salt, 32));
};

@Injectable()
export class AuthService {
  private inMemoryUsers: any[] = [
    { id: 1, username: '521H0001', name: 'Nguyễn Minh Tuấn', email: 'tuannm@student.tdtu.edu.vn', role: 'STUDENT', status: 'ACTIVE', lastLogin: new Date().toISOString() },
    { id: 2, username: 'staff.thu', name: 'Nguyễn Thị Thu', email: 'thu.nt@tdtu.edu.vn', role: 'STAFF', status: 'ACTIVE', lastLogin: new Date().toISOString() },
    { id: 3, username: 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: 'ADMIN', status: 'ACTIVE', lastLogin: new Date().toISOString() },
  ];

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany();
      if (users && users.length > 0) return users.map(({ passwordHash, ...u }) => u);
    } catch (e) {}
    return this.inMemoryUsers;
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

  private trackUser(user: any) {
    if (!user || !user.email) return;
    const idx = this.inMemoryUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    const item = {
      id: user.id || Date.now(),
      username: user.username || user.email.split('@')[0],
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      status: user.status || 'ACTIVE',
      lastLogin: new Date().toISOString(),
    };
    if (idx >= 0) {
      this.inMemoryUsers[idx] = { ...this.inMemoryUsers[idx], ...item };
    } else {
      this.inMemoryUsers.unshift(item);
    }
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

  async loginWithCredentials(username: string, _password?: string) {
    const cleanUsername = username.trim().toLowerCase();

    let user: any = null;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: cleanUsername },
            { email: cleanUsername },
          ],
        },
      });
    } catch (e) {
      // Database connection offline
    }

    if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu.');

    // Admin/Cán bộ bắt buộc có mật khẩu đúng. ponytail: sinh viên chưa có mật khẩu vẫn vào được, siết lại khi cấp mật khẩu cho sinh viên.
    const mustHavePw = user.role !== 'STUDENT';
    if ((mustHavePw || user.passwordHash) && !(user.passwordHash && _password && checkPw(_password, user.passwordHash))) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu.');
    }

    if (user.status && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc không hoạt động.');
    }

    await this.ensureStudent(user);
    const resUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.trackUser(resUser);
    return resUser;
  }

  async loginWithGoogle(email: string, name?: string, verified = false) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@tdtu.edu.vn') && !cleanEmail.endsWith('@student.tdtu.edu.vn')) {
      throw new UnauthorizedException('Hệ thống chỉ cho phép đăng nhập bằng email trường TDTU (@tdtu.edu.vn hoặc @student.tdtu.edu.vn).');
    }

    let user: any = null;

    try {
      user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    } catch (e) {
      // Database connection offline
    }

    // Chỉ cho vào tài khoản đã có trong DB (import hoặc admin tạo), không tự tạo tài khoản mới.
    if (!user) throw new UnauthorizedException('Email chưa có trong hệ thống. Vui lòng liên hệ quản trị viên.');

    // google-direct không xác thực được email, nên chỉ cho sinh viên; admin/cán bộ phải qua Google OAuth thật hoặc mật khẩu.
    if (!verified && user.role !== 'STUDENT') {
      throw new UnauthorizedException('Admin/Cán bộ vui lòng đăng nhập bằng tên tài khoản và mật khẩu.');
    }

    if (user.status && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc không hoạt động.');
    }

    await this.ensureStudent(user);
    const resUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.trackUser(resUser);
    return resUser;
  }

  async verifyGoogleIdToken(idToken: string) {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!res.ok) {
        throw new UnauthorizedException('Google ID Token không hợp lệ hoặc đã hết hạn.');
      }
      const payload = await res.json();
      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        throw new UnauthorizedException('Email Google chưa được xác thực.');
      }

      return this.loginWithGoogle(payload.email, payload.name || payload.given_name || payload.email, true);
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
      return this.loginWithGoogle(input.email, input.name, true);
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
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user) {
        return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role };
      }
    } catch (e) {
      // Fallback
    }
    return { id: 3, username: 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: 'ADMIN' as const };
  }
}
