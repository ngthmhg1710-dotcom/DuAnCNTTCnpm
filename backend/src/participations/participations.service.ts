import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { declarationStatusLabel } from '../common/declaration-status.util';

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

  // Cán bộ đổi trạng thái một lượt tham gia. 'CANCELLED' = gỡ lượt đăng ký (trả lại suất).
  // Kết quả có kèm mssv và tên hoạt động để audit log ghi rõ ai/hoạt động nào.
  async updateStatus(id: number, status: string) {
    if (![...VALID_STATUSES, 'CANCELLED'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ.');
    const found = await this.prisma.participation.findUnique({
      where: { id },
      include: { student: { select: { mssv: true } }, activity: { select: { title: true, startAt: true, cancelled: true } } },
    });
    if (!found) throw new NotFoundException('Không tìm thấy lượt tham gia.');
    // Có mặt/Vắng chỉ ghi nhận sau khi hoạt động bắt đầu; hủy đăng ký và đưa về "Đã đăng ký" thì không bị giới hạn.
    if (status === 'ATTENDED' || status === 'ABSENT') {
      const blocked = this.attendanceBlocked(found.activity);
      if (blocked) throw new BadRequestException(blocked);
    }
    const info = { mssv: found.student.mssv, activityTitle: found.activity.title, previousStatus: found.status };
    if (status === 'CANCELLED') {
      await this.prisma.participation.delete({ where: { id } });
      return { id, studentId: found.studentId, activityId: found.activityId, status, ...info };
    }
    const updated = await this.prisma.participation.update({
      where: { id },
      // Có mặt: giữ giờ điểm danh đầu tiên; rời khỏi "có mặt" thì xóa giờ điểm danh.
      data: { status, joinedAt: status === 'ATTENDED' ? found.joinedAt ?? new Date() : null },
    });
    return { ...updated, ...info };
  }

  // Lý do chưa điểm danh được một hoạt động (đã hủy hoặc chưa bắt đầu); null nếu điểm danh được.
  private attendanceBlocked(a: { startAt: Date; cancelled: boolean }) {
    if (a.cancelled) return 'Hoạt động đã bị hủy, không thể điểm danh.';
    if (a.startAt > new Date()) return 'Hoạt động chưa diễn ra, chưa thể điểm danh.';
    return null;
  }

  // Đối tượng: danh sách rỗng = mọi sinh viên; có danh sách thì sinh viên phải thuộc lớp/khóa đó. Trả về lý do nếu không thuộc.
  private audienceError(a: { targetClasses: string[]; targetCohorts: string[] }, s: { className: string | null; cohort: string | null }) {
    if (a.targetClasses.length && !a.targetClasses.includes(s.className ?? '')) return `Hoạt động chỉ dành cho lớp: ${a.targetClasses.join(', ')}.`;
    if (a.targetCohorts.length && !a.targetCohorts.includes(s.cohort ?? '')) return `Hoạt động chỉ dành cho khóa: ${a.targetCohorts.join(', ')}.`;
    return null;
  }

  // Import danh sách điểm danh (file Google Sheet xuất CSV): mỗi MSSV có trong file coi như đã được quét mã -> ATTENDED.
  // Sinh viên chưa đăng ký ("đến thẳng") vẫn phải đúng đối tượng lớp/khóa và còn suất; không thì báo lỗi dòng đó.
  // MSSV lạ -> báo lỗi dòng đó.
  async importAttendance(activityId: number, rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) throw new BadRequestException('File không có dữ liệu.');
    if (rows.length > 5000) throw new BadRequestException('Tối đa 5000 dòng mỗi lần import.');
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { participations: true } } },
    });
    if (!activity) throw new NotFoundException('Không tìm thấy hoạt động.');
    const blocked = this.attendanceBlocked(activity);
    if (blocked) throw new BadRequestException(blocked);
    let taken = activity._count.participations; // số suất đã dùng, tăng dần khi thêm sinh viên đến thẳng
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
      if (!existed) {
        const notInAudience = this.audienceError(activity, student);
        if (notInAudience) { errors.push(`Dòng ${i + 2}: ${mssv} chưa đăng ký và không thuộc đối tượng. ${notInAudience}`); continue; }
        if (activity.capacity && taken >= activity.capacity) {
          errors.push(`Dòng ${i + 2}: ${mssv} chưa đăng ký và hoạt động đã đủ ${activity.capacity} người, không thêm được.`);
          continue;
        }
        taken++;
      }
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
    return rows.map((p) => {
      const a = p.activity;
      return {
        id: p.id,
        activityId: p.activityId,
        activity: a.title,
        location: a.location,
        category: a.category,
        unit: a.unit,
        imageUrl: a.imageUrl,
        ruleCode: a.ruleCode,
        points: a.points,
        startAt: a.startAt,
        endAt: a.endAt,
        cancelled: a.cancelled,
        canCancel: p.status === 'REGISTERED' && a.startAt > new Date(),
        registeredAt: p.registeredAt,
        status: p.status,
      };
    });
  }

  // Dòng thời gian của sinh viên: mỗi lượt đăng ký/tham gia và mỗi lần khai báo là một dòng, mới nhất trước.
  async history(userId: number) {
    const student = await this.studentOf(userId);
    const [parts, decls] = await Promise.all([
      this.prisma.participation.findMany({ where: { studentId: student.id }, include: { activity: true } }),
      this.prisma.declaration.findMany({ where: { studentId: student.id } }),
    ]);
    const rows = [
      ...parts.map((p) => ({
        type: 'Tham gia',
        date: p.status === 'ATTENDED' ? p.joinedAt ?? p.activity.startAt : p.activity.cancelled ? p.registeredAt : p.activity.startAt,
        event: p.activity.title,
        status: p.activity.cancelled ? 'Đã hủy' : p.status === 'ATTENDED' ? 'Đã tham gia' : p.status === 'ABSENT' ? 'Vắng' : 'Đã đăng ký',
        activityId: p.activityId,
        points: p.status === 'ATTENDED' && !p.activity.cancelled ? p.activity.points : 0,
      })),
      ...decls.map((d) => ({
        type: 'Khai báo',
        date: d.submittedAt,
        event: d.activityName,
        status: declarationStatusLabel(d.status),
        code: d.code,
      })),
    ];
    return rows.sort((a, b) => +new Date(b.date) - +new Date(a.date));
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
    const notInAudience = this.audienceError(activity, student);
    if (notInAudience) throw new BadRequestException(notInAudience);
    if (activity.capacity && activity._count.participations >= activity.capacity)
      throw new BadRequestException(`Hoạt động đã đủ ${activity.capacity} người, không thể đăng ký thêm.`);

    return this.prisma.participation.create({ data: { studentId: student.id, activityId } });
  }

  async cancel(userId: number, activityId: number) {
    const student = await this.studentOf(userId);
    const p = await this.prisma.participation.findUnique({
      where: { studentId_activityId: { studentId: student.id, activityId } },
      include: { activity: { select: { startAt: true } } },
    });
    if (p && p.status !== 'REGISTERED') throw new BadRequestException('Đã được điểm danh, không thể hủy đăng ký.');
    // Hạn hủy: trước giờ bắt đầu hoạt động.
    if (p && p.activity.startAt <= new Date()) throw new BadRequestException('Hoạt động đã bắt đầu, không thể hủy đăng ký.');
    if (p) await this.prisma.participation.delete({ where: { id: p.id } });
    return { success: true };
  }
}
