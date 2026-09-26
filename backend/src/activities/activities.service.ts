import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  private present(activity: any) {
    const registered = activity._count?.participations ?? activity.participations?.length ?? 0;
    const now = new Date();
    const status = !activity.published ? 'Nháp' : activity.endAt && activity.endAt < now ? 'Đã kết thúc' : 'Đang mở';
    const { _count, participations, ...rest } = activity;
    return { ...rest, registered, status };
  }

  async list() {
    const activities = await this.prisma.activity.findMany({
      include: { _count: { select: { participations: true } } },
      orderBy: { startAt: 'desc' },
    });
    return activities.map((a) => this.present(a));
  }

  async detail(id: number) {
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
    if (!activity) throw new NotFoundException('Không tìm thấy hoạt động.');
    return {
      ...this.present(activity),
      participants: activity.participations.map((p) => ({
        id: p.id,
        mssv: p.student.mssv,
        name: p.student.user.name,
        className: p.student.className,
        status: p.status,
        joinedAt: p.joinedAt,
      })),
    };
  }

  create(dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        title: dto.title,
        category: dto.category,
        unit: dto.unit,
        location: dto.location,
        description: dto.description,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        capacity: dto.capacity,
        published: dto.published ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateActivityDto) {
    await this.ensureExists(id);
    return this.prisma.activity.update({
      where: { id },
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.activity.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: number) {
    const found = await this.prisma.activity.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy hoạt động.');
  }
}
