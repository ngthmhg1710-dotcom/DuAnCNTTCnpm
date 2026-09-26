import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_STATUSES = ['REGISTERED', 'ATTENDED', 'ABSENT'];

@Injectable()
export class ParticipationsService {
  constructor(private prisma: PrismaService) {}

  async list(filters: { activityId?: number; studentId?: number; status?: string }) {
    const participations = await this.prisma.participation.findMany({
      where: {
        activityId: filters.activityId,
        studentId: filters.studentId,
        status: filters.status,
      },
      include: { student: { include: { user: true } }, activity: true },
      orderBy: { registeredAt: 'desc' },
    });
    return participations.map((p) => ({
      id: p.id,
      mssv: p.student.mssv,
      name: p.student.user.name,
      activityId: p.activityId,
      activity: p.activity.title,
      registeredAt: p.registeredAt,
      status: p.status,
    }));
  }

  async updateStatus(id: number, status: string) {
    if (!VALID_STATUSES.includes(status)) throw new NotFoundException('Trạng thái không hợp lệ.');
    const found = await this.prisma.participation.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy lượt tham gia.');
    return this.prisma.participation.update({
      where: { id },
      data: { status, joinedAt: status === 'ATTENDED' ? new Date() : found.joinedAt },
    });
  }
}
