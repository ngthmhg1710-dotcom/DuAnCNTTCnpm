import { cohortFromMssv } from '../common/cohort';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertConfig, getParticipationTier } from '../common/participation-tier';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService, private alerts: AlertsService) {}

  private present(student: any, cfg?: AlertConfig) {
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
      participation: getParticipationTier(activitiesCount, cfg),
    };
  }

  // Số hoạt động và mức tham gia chỉ tính lượt đã điểm danh (ATTENDED).
  async list() {
    const students = await this.prisma.student.findMany({
      include: { user: true, _count: { select: { participations: { where: { status: 'ATTENDED' } } } } },
      orderBy: { id: 'asc' },
    });
    const cfg = await this.alerts.get();
    return students.map((s) => this.present(s, cfg));
  }

  // rows: { mssv, name, email?, className?, cohort?, major? }. MSSV/email trùng (trong DB hoặc trong file) -> báo lỗi, bỏ qua dòng đó.
  async importRows(rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) throw new BadRequestException('File không có dữ liệu.');
    if (rows.length > 2000) throw new BadRequestException('Tối đa 2000 dòng mỗi lần import.');
    let created = 0;
    const errors: string[] = [];
    for (const [i, r] of rows.entries()) {
      const mssv = String(r.mssv ?? '').trim().toUpperCase();
      const name = String(r.name ?? '').trim();
      if (!mssv || !name) { errors.push(`Dòng ${i + 2}: thiếu MSSV hoặc họ tên`); continue; }
      const email = String(r.email ?? '').trim().toLowerCase() || `${mssv.toLowerCase()}@student.tdtu.edu.vn`;
      const info = { className: r.className?.trim() || null, cohort: r.cohort?.trim() || cohortFromMssv(mssv), major: r.major?.trim() || null };
      const dup = await this.prisma.user.findFirst({ where: { OR: [{ username: mssv }, { email }] } });
      if (dup) { errors.push(`Dòng ${i + 2}: ${dup.username.toUpperCase() === mssv ? `MSSV ${mssv}` : `email ${email}`} đã tồn tại`); continue; }
      try {
        await this.prisma.user.create({ data: { username: mssv, email, name, student: { create: { mssv, ...info } } } });
        created++;
      } catch {
        errors.push(`Dòng ${i + 2}: không thêm được ${mssv}`);
      }
    }
    return { created, errors };
  }

  async detail(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        _count: { select: { participations: { where: { status: 'ATTENDED' } } } },
        participations: { include: { activity: true }, orderBy: { id: 'desc' } },
        declarations: { orderBy: { submittedAt: 'desc' } },
      },
    });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');
    return {
      ...this.present(student, await this.alerts.get()),
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
