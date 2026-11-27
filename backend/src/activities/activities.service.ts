import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  private present(activity: any) {
    const registered = activity._count?.participations ?? activity.participations?.length ?? 0;
    const now = new Date();
    // Nháp → Đang mở → (Đóng đăng ký) → Đã kết thúc (tự tính theo ngày); Đã hủy có thể đặt ở mọi lúc.
    const status = activity.cancelled
      ? 'Đã hủy'
      : !activity.published
        ? 'Nháp'
        : activity.endAt && activity.endAt < now
          ? 'Đã kết thúc'
          : activity.closed
            ? 'Đóng đăng ký'
            : 'Đang mở';
    const { _count, participations, ...rest } = activity;
    return { ...rest, registered, status };
  }

  async list(publishedOnly = false) {
    const activities = await this.prisma.activity.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: { _count: { select: { participations: true } } },
      orderBy: { startAt: 'desc' },
    });
    return activities.map((a) => this.present(a));
  }

  async detail(id: number, publishedOnly = false) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        _count: { select: { participations: true } },
        participations: {
          include: { student: { include: { user: true } } },
          orderBy: { id: 'desc' },
        },
      },
    });
    if (!activity || (publishedOnly && !activity.published)) throw new NotFoundException('Không tìm thấy hoạt động.');
    return {
      ...this.present(activity),
      participants: activity.participations.map((p) => ({
        id: p.id,
        mssv: p.student.mssv,
        name: p.student.user.name,
        className: p.student.className,
        status: p.status,
        registeredAt: p.registeredAt,
        joinedAt: p.joinedAt,
      })),
    };
  }

  private checkDates(startAt: Date, endAt?: Date | null) {
    if (endAt && endAt <= startAt) throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu.');
  }

  create(dto: CreateActivityDto) {
    this.checkDates(new Date(dto.startAt), dto.endAt ? new Date(dto.endAt) : null);
    return this.prisma.activity.create({
      data: {
        title: dto.title,
        category: dto.category,
        unit: dto.unit,
        location: dto.location,
        description: dto.description,
        imageUrl: dto.imageUrl || null,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        capacity: dto.capacity,
        published: dto.published ?? true,
        targetClasses: dto.targetClasses ?? [],
        targetCohorts: dto.targetCohorts ?? [],
        ruleCode: dto.ruleCode,
        points: dto.points ?? 0,
        remindBeforeHours: dto.remindBeforeHours ?? null,
        remindEmail: dto.remindEmail ?? false,
        remindMessage: dto.remindMessage?.trim() || null,
      },
    });
  }

  async update(id: number, dto: UpdateActivityDto) {
    const current = await this.ensureExists(id);
    // So với giá trị mới nếu có gửi lên, không thì so với giá trị đang lưu.
    this.checkDates(dto.startAt ? new Date(dto.startAt) : current.startAt, dto.endAt ? new Date(dto.endAt) : current.endAt);
    return this.prisma.activity.update({
      where: { id },
      data: {
        ...dto,
        imageUrl: dto.imageUrl === undefined ? undefined : dto.imageUrl || null,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        remindMessage: dto.remindMessage === undefined ? undefined : dto.remindMessage.trim() || null,
        // Đổi giờ bắt đầu hoặc giờ nhắc thì cho phép nhắc lại (đặt lại mốc đã nhắc).
        remindedAt: dto.startAt || dto.remindBeforeHours !== undefined ? null : undefined,
      },
    });
  }

  // Đã có người đăng ký/tham gia thì không xóa (mất lịch sử và điểm của sinh viên) mà phải hủy hoạt động.
  async remove(id: number) {
    await this.ensureExists(id);
    const joined = await this.prisma.participation.count({ where: { activityId: id } });
    if (joined) throw new BadRequestException(`Đã có ${joined} sinh viên đăng ký/tham gia, hãy hủy hoạt động thay vì xóa để giữ lại lịch sử.`);
    await this.prisma.activity.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: number) {
    const found = await this.prisma.activity.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy hoạt động.');
    return found;
  }
}
