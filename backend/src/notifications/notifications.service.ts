import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './notifications.dto';

const fmt = (d: Date) => d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async mine(userId: number) {
    const rows = await this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map((n) => ({ id: n.id, title: n.title, message: n.message, type: n.type, link: n.link, read: n.isRead, time: fmt(n.createdAt) }));
  }

  async unreadCount(userId: number) {
    return { count: await this.prisma.notification.count({ where: { userId, isRead: false } }) };
  }

  async sent(senderId: number) {
    const rows = await this.prisma.notification.groupBy({
      by: ['batchId'],
      where: { senderId },
      _count: true,
      _min: { title: true, message: true, type: true, createdAt: true },
      orderBy: { _min: { createdAt: 'desc' } },
      take: 50,
    });
    return rows.map((r) => ({ id: r.batchId, title: r._min.title ?? '', message: r._min.message ?? '', type: r._min.type ?? '', recipients: r._count, time: fmt(r._min.createdAt ?? new Date()) }));
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

  notify(userId: number, title: string, message: string, type: string, link?: string) {
    return this.prisma.notification.create({ data: { userId, title, message, type, link } });
  }

  // Chống spam: mỗi người chỉ có một thông báo CHƯA ĐỌC cho mỗi "key". Cùng key mà người đó chưa đọc thì cập nhật nội dung
  // và đưa lên đầu thay vì tạo thêm. Đã đọc rồi mà có sự kiện mới thì tạo thông báo mới.
  async upsertUnread(userId: number, key: string, data: { title: string; message: string; type: string; link?: string | null }) {
    const existing = await this.prisma.notification.findFirst({ where: { userId, batchId: key, isRead: false }, select: { id: true } });
    if (existing) {
      return this.prisma.notification.update({ where: { id: existing.id }, data: { ...data, link: data.link ?? null, createdAt: new Date() } });
    }
    return this.prisma.notification.create({ data: { userId, batchId: key, ...data, link: data.link ?? null } });
  }

  // Người này đã nhận thông báo cùng key trong N ngày gần đây chưa (dùng để không nhắc lặp).
  async receivedWithin(userId: number, key: string, days: number) {
    const since = new Date(Date.now() - days * 86400000);
    return (await this.prisma.notification.count({ where: { userId, batchId: key, createdAt: { gte: since } } })) > 0;
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
