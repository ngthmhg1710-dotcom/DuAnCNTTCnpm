import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { getParticipationTier } from '../common/participation-tier';
import { DECLARATION_STATUS_LABEL } from '../common/declaration-status.util';

export type Filters = { semesterId?: number; className?: string; cohort?: string; category?: string };
export type Report = { title: string; columns: string[]; rows: (string | number)[][] };
export const REPORT_TYPES = ['students', 'history', 'by-semester', 'low-participation', 'verification'] as const;

const PART_LABEL: Record<string, string> = { REGISTERED: 'Đã đăng ký', ATTENDED: 'Đã tham gia', ABSENT: 'Vắng' };
const fmt = (d?: Date | null) => (d ? d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '');
const countBy = <T,>(list: T[], key: (x: T) => string | null | undefined) => {
  const m = new Map<string, number>();
  for (const x of list) { const k = key(x) || 'Chưa có'; m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};
// Trạng thái hoạt động suy ra từ cờ + ngày, trùng với ActivitiesService.present.
const activityStatus = (a: { cancelled: boolean; published: boolean; endAt: Date | null; closed: boolean }, now: Date) =>
  a.cancelled ? 'Đã hủy' : !a.published ? 'Nháp' : a.endAt && a.endAt < now ? 'Đã kết thúc' : a.closed ? 'Đóng đăng ký' : 'Đang mở';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [students, activities, participations, declarations] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.activity.count(),
      this.prisma.participation.count(),
      this.prisma.declaration.count()
    ]);

    const byCategory = await this.prisma.activity.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const byDeclarationStatus = await this.prisma.declaration.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    return {
      summary: { students, activities, participations, declarations },
      byCategory: byCategory.map(x => ({ category: x.category, value: x._count._all })),
      byDeclarationStatus: byDeclarationStatus.map(x => ({ status: x.status, value: x._count._all }))
    };
  }

  // Giá trị có thật trong dữ liệu để đổ vào các ô lọc (không dùng danh sách cứng).
  async filterOptions() {
    const [semesters, students, acts] = await Promise.all([
      this.prisma.semester.findMany({ orderBy: { startDate: 'desc' } }),
      this.prisma.student.findMany({ select: { className: true, cohort: true } }),
      this.prisma.activity.findMany({ select: { category: true }, distinct: ['category'] }),
    ]);
    const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))].sort();
    return {
      semesters: semesters.map((s) => ({ id: s.id, name: `${s.name} ${s.year}`, isCurrent: s.isCurrent })),
      classes: uniq(students.map((s) => s.className)),
      cohorts: uniq(students.map((s) => s.cohort)),
      categories: uniq(acts.map((a) => a.category)),
    };
  }

  private studentWhere(f: Filters) {
    return { ...(f.className ? { className: f.className } : {}), ...(f.cohort ? { cohort: f.cohort } : {}) };
  }

  // Số liệu dashboard theo bộ lọc. Không có semesterId = mọi học kỳ.
  async dashboard(f: Filters = {}) {
    const now = new Date();
    const sw = this.studentWhere(f);
    const [semesters, students, acts, parts, decls] = await Promise.all([
      this.prisma.semester.findMany({ orderBy: { startDate: 'asc' } }),
      this.prisma.student.findMany({ where: sw, select: { className: true, cohort: true } }),
      this.prisma.activity.findMany({ where: f.category ? { category: f.category } : undefined }),
      // Lượt tham gia chỉ tính hoạt động đã công bố, chưa hủy, của sinh viên trong bộ lọc.
      this.prisma.participation.findMany({
        where: { student: sw, activity: { published: true, cancelled: false, ...(f.category ? { category: f.category } : {}) } },
        select: { status: true, activity: { select: { startAt: true } }, student: { select: { className: true, cohort: true } } },
      }),
      this.prisma.declaration.findMany({ where: { student: sw }, select: { status: true } }),
    ]);
    const sem = f.semesterId ? semesters.find((x) => x.id === f.semesterId) : null;
    const inSem = (d: Date, s = sem) => !s || (d >= s.startDate && d <= s.endDate);
    const actsIn = acts.filter((a) => inSem(a.startAt));
    const partsIn = parts.filter((p) => inSem(p.activity.startAt));
    const attended = partsIn.filter((p) => p.status === 'ATTENDED');
    const held = partsIn.filter((p) => p.activity.startAt <= now); // chỉ hoạt động đã đến giờ mới tính tỷ lệ
    const { flagged } = await this.flaggedStudents(f.semesterId, sw);

    const month = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const byMonth = countBy(actsIn, (a) => month(a.startAt))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((x) => ({ name: `${x.name.slice(5)}/${x.name.slice(0, 4)}`, value: x.value }));
    const group = (key: 'className' | 'cohort') =>
      [...new Set(students.map((s) => s[key] || 'Chưa có'))]
        .map((name) => ({
          name,
          students: students.filter((s) => (s[key] || 'Chưa có') === name).length,
          attended: attended.filter((p) => (p.student[key] || 'Chưa có') === name).length,
        }))
        .sort((a, b) => b.students - a.students);

    return {
      semester: sem ? `${sem.name} ${sem.year}` : 'Tất cả học kỳ',
      students: students.length,
      activities: actsIn.length,
      participations: partsIn.length,
      attended: attended.length,
      participationRate: held.length ? Math.round((held.filter((p) => p.status === 'ATTENDED').length / held.length) * 100) : 0,
      pendingVerification: decls.filter((d) => d.status === 'SUBMITTED' || d.status === 'PROCESSING').length,
      needsMoreInfo: decls.filter((d) => d.status === 'NEEDS_MORE_INFO').length,
      attentionCount: flagged.length,
      byCategory: countBy(actsIn, (a) => a.category).map((x) => ({ category: x.name, value: x.value })),
      byStatus: countBy(actsIn, (a) => activityStatus(a, now)),
      byMonth,
      byClass: group('className'),
      byCohort: group('cohort'),
      bySemester: semesters.map((s) => ({
        name: `${s.name} ${s.year}`,
        activities: acts.filter((a) => inSem(a.startAt, s)).length,
        attended: parts.filter((p) => p.status === 'ATTENDED' && inSem(p.activity.startAt, s)).length,
      })),
      byDeclarationStatus: countBy(decls, (d) => DECLARATION_STATUS_LABEL[d.status]).map((x) => ({ status: x.name, value: x.value })),
    };
  }

  async report(type: (typeof REPORT_TYPES)[number], f: Filters = {}): Promise<Report> {
    const sw = this.studentWhere(f);
    const sem = f.semesterId ? await this.prisma.semester.findUnique({ where: { id: f.semesterId } }) : null;
    const inSem = (d: Date) => !sem || (d >= sem.startDate && d <= sem.endDate);
    const semName = sem ? ` – ${sem.name} ${sem.year}` : '';

    if (type === 'low-participation') {
      const { semester, students } = await this.attentionStudents(f.semesterId, sw);
      return {
        title: `Sinh viên tham gia thấp${semester ? ` – ${semester}` : ''}`,
        columns: ['MSSV', 'Họ tên', 'Lớp', 'Khóa', 'Số HĐ đã tham gia', 'Nhóm còn thiếu', 'Mức cảnh báo', 'Đề xuất'],
        rows: students.map((s) => [s.mssv, s.name, s.className ?? '', s.cohort ?? '', s.activities, s.missingCriteria, s.warning, s.suggestion]),
      };
    }

    if (type === 'verification') {
      const decls = await this.prisma.declaration.findMany({ where: { student: sw }, include: { student: { include: { user: true } } }, orderBy: { submittedAt: 'desc' } });
      return {
        title: `Báo cáo xác minh khai báo${semName}`,
        columns: ['Mã', 'MSSV', 'Họ tên', 'Hoạt động', 'Đơn vị', 'Ngày gửi', 'Trạng thái', 'Người xử lý'],
        rows: decls.filter((d) => inSem(d.submittedAt)).map((d) => [d.code, d.student.mssv, d.student.user.name, d.activityName, d.unit, fmt(d.submittedAt), DECLARATION_STATUS_LABEL[d.status], d.handler ?? '']),
      };
    }

    // 3 báo cáo còn lại dựa trên lượt tham gia của hoạt động đã công bố, chưa hủy.
    const parts = (
      await this.prisma.participation.findMany({
        where: { student: sw, activity: { published: true, cancelled: false, ...(f.category ? { category: f.category } : {}) } },
        include: { activity: true, student: { include: { user: true } } },
        orderBy: { activity: { startAt: 'desc' } },
      })
    ).filter((p) => inSem(p.activity.startAt));

    if (type === 'history') {
      return {
        title: `Lịch sử hoạt động${semName}`,
        columns: ['Thời gian', 'Hoạt động', 'Loại', 'MSSV', 'Họ tên', 'Lớp', 'Trạng thái', 'Điểm'],
        rows: parts.map((p) => [fmt(p.activity.startAt), p.activity.title, p.activity.category, p.student.mssv, p.student.user.name, p.student.className ?? '', PART_LABEL[p.status] ?? p.status, p.status === 'ATTENDED' ? p.activity.points : 0]),
      };
    }

    if (type === 'students') {
      const students = await this.prisma.student.findMany({ where: sw, include: { user: true }, orderBy: { mssv: 'asc' } });
      return {
        title: `Danh sách sinh viên${semName}`,
        columns: ['MSSV', 'Họ tên', 'Lớp', 'Khóa', 'Đã đăng ký', 'Đã tham gia', 'Mức tham gia'],
        rows: students.map((s) => {
          const mine = parts.filter((p) => p.studentId === s.id);
          const attended = mine.filter((p) => p.status === 'ATTENDED').length;
          return [s.mssv, s.user.name, s.className ?? '', s.cohort ?? '', mine.length, attended, getParticipationTier(attended)];
        }),
      };
    }

    // by-semester: mỗi học kỳ × loại hoạt động
    const semesters = await this.prisma.semester.findMany({ where: sem ? { id: sem.id } : undefined, orderBy: { startDate: 'desc' } });
    const acts = await this.prisma.activity.findMany({ where: { cancelled: false, published: true, ...(f.category ? { category: f.category } : {}) } });
    const rows: (string | number)[][] = [];
    for (const s of semesters) {
      const inS = (d: Date) => d >= s.startDate && d <= s.endDate;
      for (const c of [...new Set(acts.filter((a) => inS(a.startAt)).map((a) => a.category))]) {
        const pc = parts.filter((p) => p.activity.category === c && inS(p.activity.startAt));
        const att = pc.filter((p) => p.status === 'ATTENDED').length;
        rows.push([`${s.name} ${s.year}`, c, acts.filter((a) => a.category === c && inS(a.startAt)).length, pc.length, att, pc.length ? `${Math.round((att / pc.length) * 100)}%` : '0%']);
      }
    }
    return { title: 'Hoạt động theo học kỳ', columns: ['Học kỳ', 'Loại hoạt động', 'Số hoạt động', 'Lượt đăng ký', 'Đã tham gia', 'Tỷ lệ tham gia'], rows };
  }

  // Học kỳ được chọn (semesterId), hoặc học kỳ hiện tại / mới nhất.
  private async pickSemester(semesterId?: number) {
    if (semesterId) return this.prisma.semester.findUnique({ where: { id: semesterId } });
    return (
      (await this.prisma.semester.findFirst({ where: { isCurrent: true } })) ??
      (await this.prisma.semester.findFirst({ orderBy: { startDate: 'desc' } }))
    );
  }

  // Nhóm bắt buộc = nhóm của các tiêu chí trong học kỳ; chỉ tính lần tham gia nằm trong học kỳ.
  private async flaggedStudents(semesterId?: number, studentWhere: object = {}) {
    const semester = await this.pickSemester(semesterId);
    const groups = semester
      ? (await this.prisma.criteria.findMany({ where: { semesterId: semester.id }, select: { group: true }, distinct: ['group'] })).map((r) => r.group)
      : [];
    const inSemester = { cancelled: false, ...(semester ? { startAt: { gte: semester.startDate, lte: semester.endDate } } : {}) };
    const students = await this.prisma.student.findMany({
      where: studentWhere,
      include: {
        user: true,
        // chỉ lần đã điểm danh (ATTENDED) mới tính là "tham gia"
        participations: { where: { status: 'ATTENDED', activity: inSemester }, include: { activity: true } },
        declarations: { where: { status: { in: ['SUBMITTED', 'PROCESSING', 'NEEDS_MORE_INFO'] } }, select: { id: true } },
      },
    });
    const flagged = students
      .map((s) => {
        const count = s.participations.length;
        const tier = getParticipationTier(count);
        const coveredCategories = new Set(s.participations.map((p) => p.activity.category));
        const missingCategories = groups.filter((c) => !coveredCategories.has(c));
        return { student: s, count, tier, missingCategories, pending: s.declarations.length };
      })
      .filter((s) => s.tier !== 'Cao');
    return { semester, flagged };
  }

  async attentionStudents(semesterId?: number, studentWhere: object = {}) {
    const { semester, flagged } = await this.flaggedStudents(semesterId, studentWhere);
    return {
      semester: semester ? `${semester.name} ${semester.year}` : null,
      pendingRequests: flagged.reduce((n, f) => n + f.pending, 0),
      students: flagged.map(({ student, count, tier, missingCategories, pending }) => ({
        id: student.id,
        mssv: student.mssv,
        name: student.user.name,
        className: student.className,
        cohort: student.cohort,
        activities: count,
        missingCriteria: missingCategories.length,
        pendingRequests: pending,
        warning: tier === 'Thấp' ? 'Cao' : 'Trung bình',
        suggestion: pending
          ? `Có ${pending} minh chứng đang chờ xử lý, duyệt trước khi đánh giá`
          : missingCategories.length
            ? `Cần bổ sung hoạt động thuộc nhóm "${missingCategories[0]}"`
            : 'Đã tham gia đủ các nhóm hoạt động, cần tăng số lượng',
      })),
    };
  }

  async recommendations(semesterId?: number) {
    const { flagged } = await this.flaggedStudents(semesterId);
    const now = new Date();
    const results: { student: string; mssv: string; missing: string; activityId: number | null; activityTitle: string | null; category: string | null; startAt: Date | null }[] = [];

    for (const { student, missingCategories } of flagged) {
      if (!missingCategories.length) continue;
      const suggestion = await this.prisma.activity.findFirst({
        where: {
          category: missingCategories[0],
          published: true,
          startAt: { gte: now },
          cancelled: false,
          participations: { none: { studentId: student.id } }, // đã đăng ký/tham gia rồi thì không gợi ý lại
        },
        orderBy: { startAt: 'asc' },
      });
      results.push({
        student: student.user.name,
        mssv: student.mssv,
        missing: missingCategories[0],
        activityId: suggestion?.id ?? null,
        activityTitle: suggestion?.title ?? null,
        category: suggestion?.category ?? null,
        startAt: suggestion?.startAt ?? null,
      });
    }
    return results;
  }
}
