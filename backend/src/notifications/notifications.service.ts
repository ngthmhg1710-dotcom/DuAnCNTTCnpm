import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './notifications.dto';

const fmt = (d: Date) => d.toLocaleString('vi-VN');

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async mine(userId: number) {
    const rows = await this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map((n) => ({ id: n.id, title: n.title, message: n.message, type: n.type, read: n.isRead, time: fmt(n.createdAt) }));
  }

  async sent(senderId: number) {
    const rows = await this.prisma.notification.groupBy({
      by: ['batchId', 'title', 'message', 'type', 'createdAt'],
      where: { senderId },
      _count: true,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({ id: r.batchId, title: r.title, message: r.message, type: r.type, recipients: r._count, time: fmt(r.createdAt) }));
  }

  async broadcast(dto: CreateNotificationDto, senderId: number) {
    const students = await this.prisma.student.findMany({
      where: { className: dto.className || undefined, cohort: dto.cohort || undefined },
      select: { userId: true },
    });
    if (!students.length) throw new BadRequestException('Không có sinh viên phù hợp với đối tượng đã chọn.');
    const batchId = randomUUID();
    const createdAt = new Date();
    await this.prisma.notification.createMany({
      data: students.map((s) => ({ userId: s.userId, senderId, batchId, createdAt, title: dto.title, message: dto.message })),
    });
    return { sent: students.length };
  }

  notify(userId: number, title: string, message: string, type: string) {
    return this.prisma.notification.create({ data: { userId, title, message, type } });
  }

  async markRead(userId: number, id: number) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
    return { success: true };
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  }
}
