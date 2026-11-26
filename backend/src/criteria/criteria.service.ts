import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CriteriaDto } from './criteria.dto';

@Injectable()
export class CriteriaService {
  constructor(private prisma: PrismaService) {}

  private inSemester(s: { startDate: Date; endDate: Date }) {
    return { gte: s.startDate, lte: s.endDate };
  }

  // Điểm ước tính của 1 tiêu chí theo quy chế: cộng điểm/lần của các hoạt động đã tham gia,
  // ghi nhận tối đa bằng điểm tối đa của tiêu chí (quy chế: 20 điểm/mục). Chỉ là điểm tham khảo.
  private earned(cap: number, activityPoints: number[]) {
    return Math.min(activityPoints.reduce((a, b) => a + b, 0), cap);
  }

  private rank(score: number, maxTotal = 100) {
    if (!maxTotal) return 'Chưa cấu hình điểm';
    return score >= 90 ? 'Xuất sắc' : score >= 80 ? 'Tốt' : score >= 65 ? 'Khá' : score >= 50 ? 'Trung bình' : score >= 35 ? 'Yếu' : 'Kém';
  }

  // Tổng hợp điểm ước tính của mọi sinh viên trong một học kỳ (mặc định: học kỳ hiện tại).
  async summary(semesterId?: number) {
    const semester = semesterId
      ? await this.prisma.semester.findUnique({ where: { id: semesterId } })
      : (await this.prisma.semester.findFirst({ where: { isCurrent: true } })) ??
        (await this.prisma.semester.findFirst({ orderBy: { startDate: 'desc' } }));
    if (!semester) return { semester: null, maxTotal: 0, criteria: [], students: [] };
    const criteria = await this.prisma.criteria.findMany({ where: { semesterId: semester.id }, orderBy: { id: 'asc' } });
    const maxTotal = Math.min(criteria.reduce((sum, c) => sum + c.points, 0), 100);
    const students = await this.prisma.student.findMany({
      include: {
        user: true,
        participations: { where: { status: 'ATTENDED', activity: { startAt: this.inSemester(semester) } }, include: { activity: { select: { category: true, points: true } } } },
      },
      orderBy: { mssv: 'asc' },
    });
    return {
      semester: { id: semester.id, label: `${semester.name} ${semester.year}` },
      maxTotal,
      criteria: criteria.map((c) => ({ id: c.id, group: c.group, name: c.name, requirement: c.requirement, points: c.points })),
      students: students.map((s) => {
        const byCriteria = criteria.map((c) => this.earned(c.points, s.participations.filter((p) => p.activity.category === c.group).map((p) => p.activity.points)));
        const estimated = Math.min(byCriteria.reduce((a, b) => a + b, 0), 100);
        return { id: s.id, mssv: s.mssv, name: s.user.name, className: s.className, attended: s.participations.length, byCriteria, estimated, rank: this.rank(estimated, maxTotal) };
      }),
    };
  }

  async list() {
    const rows = await this.prisma.criteria.findMany({ include: { semester: true }, orderBy: { id: 'asc' } });
    return Promise.all(
      rows.map(async (c) => ({
        id: c.id,
        semesterId: c.semesterId,
        group: c.group,
        name: c.name,
        description: c.description,
        requirement: c.requirement,
        points: c.points,
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
    const student = await this.prisma.student.findUnique({ where: { userId } });
    return this.studentProgress(student?.id);
  }

  // Cán bộ xem tiến độ tiêu chí của một sinh viên (theo Student.id).
  async progressOfStudent(studentId: number) {
    if (!(await this.prisma.student.findUnique({ where: { id: studentId } }))) throw new NotFoundException('Không tìm thấy sinh viên.');
    return this.studentProgress(studentId);
  }

  // Tính trên toàn bộ tiêu chí cấu hình cho học kỳ hiện tại: tiêu chí khớp với hoạt động qua Criteria.group = Activity.category.
  private async studentProgress(studentId?: number) {
    const semester =
      (await this.prisma.semester.findFirst({ where: { isCurrent: true } })) ??
      (await this.prisma.semester.findFirst({ orderBy: { startDate: 'desc' } }));
    const empty = { items: [], estimated: 0, maxTotal: 0, rank: this.rank(0, 0) };
    if (!semester || !studentId) return { semester: semester ? `${semester.name} ${semester.year}` : null, ...empty };
    const student = { id: studentId };
    const criteria = await this.prisma.criteria.findMany({ where: { semesterId: semester.id }, orderBy: { id: 'asc' } });
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
        points: c.points,
        earned: this.earned(c.points, done.map((p) => p.activity.points)),
        done: done.map((p) => ({ name: p.activity.title, date: p.activity.startAt, points: p.activity.points, status: 'Đã xác minh' })),
      };
    });
    const estimated = Math.min(items.reduce((sum, i) => sum + i.earned, 0), 100);
    const maxTotal = Math.min(items.reduce((sum, i) => sum + i.points, 0), 100);
    return { semester: `${semester.name} ${semester.year}`, items, estimated, maxTotal, rank: this.rank(estimated, maxTotal) };
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
}
