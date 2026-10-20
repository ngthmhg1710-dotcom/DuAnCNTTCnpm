import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const roleLabel: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Cán bộ', STUDENT: 'Sinh viên' };

@Controller('audit-logs')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private prisma: PrismaService) {}

  // ponytail: 500 dòng mới nhất, chưa phân trang; thêm skip/take khi log nhiều.
  @Get()
  async list() {
    const logs = await this.prisma.auditLog.findMany({ include: { user: true }, orderBy: { id: 'desc' }, take: 500 });
    return logs.map((l) => ({
      id: l.id,
      time: l.createdAt,
      user: l.user?.name ?? l.detail ?? 'Không xác định',
      role: l.user ? roleLabel[l.user.role] : '—',
      action: l.action,
      object: l.object,
      objectId: l.objectId,
      status: l.status === 'SUCCESS' ? 'Thành công' : 'Thất bại',
      detail: l.detail,
    }));
  }
}
