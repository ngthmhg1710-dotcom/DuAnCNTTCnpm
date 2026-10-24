import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ACCESS, readToken } from './tokens';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  // Đọc JWT access token (cookie HttpOnly hoặc header Bearer).
  // ponytail: 1 query/request để khóa/xóa tài khoản và đăng xuất có hiệu lực ngay; cache ngắn hạn nếu tải lớn.
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers.authorization?.replace(/^Bearer /, '');
    const payload = readToken(request.cookies?.[ACCESS] || bearer, 'access');
    if (!payload) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn.');
    const user = payload.user;
    const row = await this.prisma.user.findUnique({ where: { id: user.id }, select: { status: true, tokenVersion: true } });
    if (!row || row.status !== 'ACTIVE') throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không còn tồn tại.');
    if (row.tokenVersion !== payload.tv) throw new UnauthorizedException('Phiên đăng nhập đã bị hủy.');
    request.user = user;
    return true;
  }
}
