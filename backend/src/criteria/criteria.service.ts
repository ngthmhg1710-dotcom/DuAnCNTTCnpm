import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CriteriaDto } from './criteria.dto';

@Injectable()
export class CriteriaService {
  constructor(private prisma: PrismaService) {}

  private readonly regulationCriteria = [
    { group: 'Học tập & Học thuật', name: 'Tham gia học tập và hoạt động chuyên môn học thuật', requirement: 1 },
    { group: 'Nội quy quy chế', name: 'Chấp hành nội quy, quy chế và quy định của Trường', requirement: 1 },
    { group: 'Chính trị xã hội văn hóa thể thao', name: 'Tham gia hoạt động chính trị, xã hội, văn hóa, văn nghệ, thể thao', requirement: 1 },
    { group: 'Cộng đồng tình nguyện', name: 'Tham gia công tác xã hội và hoạt động tình nguyện', requirement: 1 },
    { group: 'Tiên phong gương mẫu', name: 'Phát huy tinh thần tiên phong và gương mẫu', requirement: 1 },
    { group: 'Điểm thưởng', name: 'Giấy khen, giải thưởng và thành tích nổi bật', requirement: 1 },
  ];

  private inSemester(s: { startDate: Date; endDate: Date }) {
    return { gte: s.startDate, lte: s.endDate };
  }

  async list() {
    const canonicalGroups = this.regulationCriteria.map((item) => item.group);
    const rows = await this.prisma.criteria.findMany({
      where: { group: { in: canonicalGroups } },
      include: { semester: true },
      orderBy: { id: 'asc' },
    });
    await this.ensureRegulationCriteria();
    const synchronizedRows = await this.prisma.criteria.findMany({
      where: { group: { in: canonicalGroups } },
      include: { semester: true },
      orderBy: { id: 'asc' },
    });
    const finalRows = synchronizedRows.length ? synchronizedRows : rows;
    return Promise.all(
      finalRows.map(async (c) => ({
        id: c.id,
        semesterId: c.semesterId,
        group: c.group,
        name: c.name,
        description: c.description,
        requirement: c.requirement,
        semester: `${c.semester.name} ${c.semester.year}`,
        status: c.semester.isCurrent ? 'Đang áp dụng' : 'Không áp dụng',
        activities: await this.prisma.activity.count({ where: { category: c.group, startAt: this.inSemester(c.semester) } }),
      })),
    );
  }

  async create(dto: CriteriaDto) {
    await this.ensureSemester(dto.semesterId);
    return this.prisma.criteria.create({ data: dto });
  }

  async update(id: number, dto: CriteriaDto) {
    await this.ensure(id);
    await this.ensureSemester(dto.semesterId);
    return this.prisma.criteria.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensure(id);
    await this.prisma.criteria.delete({ where: { id } });
    return { success: true };
  }

  // Tiến độ của sinh viên trong học kỳ hiện tại (hoặc học kỳ mới nhất nếu chưa đặt hiện tại).
  // ponytail: chỉ đếm Participation ATTENDED; khai báo ngoài trường chưa tính vào tiến độ.
  async progress(userId: number) {
    const semester =
      (await this.prisma.semester.findFirst({ where: { isCurrent: true } })) ??
      (await this.prisma.semester.findFirst({ orderBy: { startDate: 'desc' } }));
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!semester || !student) return { semester: semester ? `${semester.name} ${semester.year}` : null, items: [] };
    await this.ensureRegulationCriteria(semester.id);
    const canonicalGroups = this.regulationCriteria.map((item) => item.group);
    const criteria = await this.prisma.criteria.findMany({
      where: { semesterId: semester.id, group: { in: canonicalGroups } },
      orderBy: { id: 'asc' },
    });
    const attended = await this.prisma.participation.findMany({
      where: { studentId: student.id, status: 'ATTENDED', activity: { startAt: this.inSemester(semester) } },
      include: { activity: true },
      orderBy: { activity: { startAt: 'desc' } },
    });

    const items = criteria.map((c) => {
      const done = attended.filter((p) => p.activity.category === c.group);
      const current = done.length;
      return {
        id: c.id,
        name: c.name,
        group: c.group,
        required: c.requirement,
        current,
        missing: Math.max(c.requirement - current, 0),
        pct: Math.min(Math.round((current / c.requirement) * 100), 100),
        done: done.map((p) => ({ name: p.activity.title, date: p.activity.startAt, status: 'Đã xác minh' })),
      };
    });
    return { semester: `${semester.name} ${semester.year}`, items };
  }

  async progressDetail(userId: number, id: number) {
    const { items } = await this.progress(userId);
    const item = items.find((i) => i.id === id);
    if (!item) throw new NotFoundException('Không tìm thấy tiêu chí.');

    const student = await this.prisma.student.findUnique({ where: { userId } });
    const recommended = item.missing
      ? await this.prisma.activity.findMany({
          where: {
            category: item.group,
            published: true,
            startAt: { gte: new Date() },
            participations: { none: { studentId: student!.id } },
          },
          orderBy: { startAt: 'asc' },
          take: 4,
        })
      : [];
    return { ...item, recommended: recommended.map((a) => ({ id: a.id, name: a.title, unit: a.unit, time: a.startAt })) };
  }

  private async ensure(id: number) {
    if (!(await this.prisma.criteria.findUnique({ where: { id } }))) throw new NotFoundException('Không tìm thấy tiêu chí.');
  }

  private async ensureSemester(id: number) {
    if (!(await this.prisma.semester.findUnique({ where: { id } }))) throw new NotFoundException('Không tìm thấy học kỳ.');
  }

  private async ensureRegulationCriteria(semesterId?: number) {
    const semester = semesterId
      ? await this.prisma.semester.findUnique({ where: { id: semesterId } })
      : (await this.prisma.semester.findFirst({ where: { isCurrent: true } })) ??
        (await this.prisma.semester.findFirst({ orderBy: { startDate: 'desc' } }));
    if (!semester) return;

    for (const item of this.regulationCriteria) {
      const existing = await this.prisma.criteria.findFirst({
        where: { semesterId: semester.id, group: item.group },
      });
      if (!existing) {
        await this.prisma.criteria.create({
          data: { ...item, semesterId: semester.id },
        });
      }
    }
  }
}
