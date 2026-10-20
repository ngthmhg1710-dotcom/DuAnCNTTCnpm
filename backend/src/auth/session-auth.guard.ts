import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  // ponytail: 1 query/request để khóa/xóa tài khoản có hiệu lực ngay; cache ngắn hạn nếu tải lớn.
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;
    if (!user) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn.');
    let row: { status: string } | null;
    try {
      row = await this.prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
    } catch {
      row = { status: 'ACTIVE' }; // DB lỗi: giữ hành vi cũ, không đá người dùng ra
    }
    if (!row || row.status !== 'ACTIVE') {
      request.session = null;
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không còn tồn tại.');
    }
    request.user = user;
    return true;
  }
}
