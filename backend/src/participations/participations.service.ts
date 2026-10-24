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
      registeredAt: p.registeredAt,
      status: p.status,
    }));
  }

  async register(userId: number, activityId: number) {
    const student = await this.studentOf(userId);
    return this.prisma.participation.upsert({
      where: { studentId_activityId: { studentId: student.id, activityId } },
      update: {},
      create: { studentId: student.id, activityId },
    });
  }

  async cancel(userId: number, activityId: number) {
    const student = await this.studentOf(userId);
    await this.prisma.participation.deleteMany({ where: { studentId: student.id, activityId, status: 'REGISTERED' } });
    return { success: true };
  }
}
