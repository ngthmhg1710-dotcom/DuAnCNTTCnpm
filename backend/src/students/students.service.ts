import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { getParticipationTier } from '../common/participation-tier';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private present(student: any) {
    const activitiesCount = student._count?.participations ?? 0;
    return {
      id: student.id,
      mssv: student.mssv,
      name: student.user.name,
      email: student.user.email,
      className: student.className,
      cohort: student.cohort,
      major: student.major,
      status: student.user.status === 'ACTIVE' ? 'Đang học' : 'Ngưng học',
      activities: activitiesCount,
      participation: getParticipationTier(activitiesCount),
    };
  }

  async list() {
    const students = await this.prisma.student.findMany({
      include: { user: true, _count: { select: { participations: true } } },
      orderBy: { id: 'asc' },
    });
    return students.map((s) => this.present(s));
  }

  async detail(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        _count: { select: { participations: true } },
        participations: { include: { activity: true }, orderBy: { id: 'desc' } },
        declarations: { orderBy: { submittedAt: 'desc' } },
      },
    });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');
    return {
      ...this.present(student),
      participations: student.participations.map((p) => ({
        id: p.id,
        activityId: p.activityId,
        activityTitle: p.activity.title,
        category: p.activity.category,
        startAt: p.activity.startAt,
        status: p.status,
      })),
      declarations: student.declarations.map((d) => ({
        code: d.code,
        activityName: d.activityName,
        unit: d.unit,
        submittedAt: d.submittedAt,
        status: d.status,
      })),
    };
  }
}
