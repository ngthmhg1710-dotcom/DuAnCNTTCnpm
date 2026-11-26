import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  // Import danh sách điểm danh (file Google Sheet xuất CSV): mỗi MSSV có trong file coi như đã được quét mã -> ATTENDED.
  // Chưa đăng ký trước thì tạo mới (đến thẳng sự kiện). MSSV lạ -> báo lỗi dòng đó.
  async importAttendance(activityId: number, rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) throw new BadRequestException('File không có dữ liệu.');
    if (rows.length > 5000) throw new BadRequestException('Tối đa 5000 dòng mỗi lần import.');
    if (!(await this.prisma.activity.findUnique({ where: { id: activityId } }))) throw new NotFoundException('Không tìm thấy hoạt động.');
    let updated = 0, created = 0;
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const [i, r] of rows.entries()) {
      const mssv = String(r.mssv ?? '').trim().toUpperCase();
      if (!mssv) { errors.push(`Dòng ${i + 2}: thiếu MSSV`); continue; }
      if (seen.has(mssv)) continue; // quét trùng
      seen.add(mssv);
      const student = await this.prisma.student.findUnique({ where: { mssv } });
      if (!student) { errors.push(`Dòng ${i + 2}: không có sinh viên ${mssv}`); continue; }
      const key = { studentId_activityId: { studentId: student.id, activityId } };
      const existed = await this.prisma.participation.findUnique({ where: key });
      await this.prisma.participation.upsert({
        where: key,
        update: { status: 'ATTENDED', joinedAt: existed?.joinedAt ?? new Date() },
        create: { studentId: student.id, activityId, status: 'ATTENDED', joinedAt: new Date() },
      });
      existed ? updated++ : created++;
    }
    return { updated, created, errors };
  }

  private async studentOf(userId: number) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new BadRequestException('Không tìm thấy thông tin sinh viên.');
    return student;
  }

  async mine(userId: number) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) return [];
    const rows = await this.prisma.participation.findMany({
      where: { studentId: student.id },
      include: { activity: true },
      orderBy: { registeredAt: 'desc' },
    });
    return rows.map((p) => ({
      id: p.id,
      activityId: p.activityId,
      activity: p.activity.title,
      location: p.activity.location,
      category: p.activity.category,
      ruleCode: p.activity.ruleCode,
      points: p.activity.points,
      registeredAt: p.registeredAt,
      status: p.status,
    }));
  }

  // ponytail: đếm rồi mới tạo, nên 2 người bấm cùng lúc ở chỗ cuối có thể vượt 1 suất; cần khóa hàng (SELECT ... FOR UPDATE) nếu đăng ký rất đông.
  async register(userId: number, activityId: number) {
    const student = await this.studentOf(userId);
    const key = { studentId_activityId: { studentId: student.id, activityId } };
    const existing = await this.prisma.participation.findUnique({ where: key });
    if (existing) return existing; // đăng ký lại không tính thêm suất

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { participations: true } } },
    });
    if (!activity || !activity.published) throw new NotFoundException('Không tìm thấy hoạt động.');
    if (activity.cancelled) throw new BadRequestException('Hoạt động đã bị hủy.');
    if (activity.closed) throw new BadRequestException('Hoạt động đã đóng đăng ký.');
    if ((activity.endAt ?? activity.startAt) < new Date()) throw new BadRequestException('Hoạt động đã kết thúc, không thể đăng ký.');
    // Đối tượng: danh sách rỗng = mọi sinh viên; có danh sách thì sinh viên phải thuộc lớp/khóa đó.
    if (activity.targetClasses.length && !activity.targetClasses.includes(student.className ?? ''))
      throw new BadRequestException(`Hoạt động chỉ dành cho lớp: ${activity.targetClasses.join(', ')}.`);
    if (activity.targetCohorts.length && !activity.targetCohorts.includes(student.cohort ?? ''))
      throw new BadRequestException(`Hoạt động chỉ dành cho khóa: ${activity.targetCohorts.join(', ')}.`);
    if (activity.capacity && activity._count.participations >= activity.capacity)
      throw new BadRequestException(`Hoạt động đã đủ ${activity.capacity} người, không thể đăng ký thêm.`);

    return this.prisma.participation.create({ data: { studentId: student.id, activityId } });
  }

  async cancel(userId: number, activityId: number) {
    const student = await this.studentOf(userId);
    const p = await this.prisma.participation.findUnique({ where: { studentId_activityId: { studentId: student.id, activityId } } });
    if (p && p.status !== 'REGISTERED') throw new BadRequestException('Đã được điểm danh, không thể hủy đăng ký.');
    if (p) await this.prisma.participation.delete({ where: { id: p.id } });
    return { success: true };
  }
}
