import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SemesterDto } from './semesters.dto';

@Injectable()
export class SemestersService {
  constructor(private prisma: PrismaService) {}

  private present(s: any) {
    const status = s.isCurrent ? 'Hiện tại' : s.endDate < new Date() ? 'Đã kết thúc' : 'Sắp tới';
    return { id: s.id, name: s.name, year: s.year, startDate: s.startDate, endDate: s.endDate, isCurrent: s.isCurrent, status };
  }

  async list() {
    const rows = await this.prisma.semester.findMany({ orderBy: { startDate: 'desc' } });
    return rows.map((s) => this.present(s));
  }

  async create(dto: SemesterDto) {
    const data = this.data(dto);
    await this.validate(data);
    return this.present(await this.prisma.semester.create({ data }));
  }

  async update(id: number, dto: SemesterDto) {
    const old = await this.ensure(id);
    const data = this.data(dto);
    await this.validate(data, id);
    // Đổi khoảng thời gian không được làm hoạt động đang thuộc học kỳ này bị "rơi ra ngoài".
    const orphaned = await this.prisma.activity.count({
      where: { startAt: { gte: old.startDate, lte: old.endDate }, NOT: { startAt: { gte: data.startDate, lte: data.endDate } } },
    });
    if (orphaned) throw new ConflictException(`Có ${orphaned} hoạt động đang thuộc học kỳ này nằm ngoài khoảng thời gian mới. Hãy giữ khoảng thời gian bao phủ các hoạt động đó.`);
    return this.present(await this.prisma.semester.update({ where: { id }, data }));
  }

  async setCurrent(id: number) {
    await this.ensure(id);
    await this.prisma.$transaction([
      this.prisma.semester.updateMany({ data: { isCurrent: false } }),
      this.prisma.semester.update({ where: { id }, data: { isCurrent: true } }),
    ]);
    return { success: true };
  }

  async remove(id: number) {
    const s = await this.ensure(id);
    if (s.isCurrent) throw new ConflictException('Không thể xóa học kỳ hiện tại. Hãy đặt học kỳ khác làm hiện tại trước.');
    const activities = await this.prisma.activity.count({ where: { startAt: { gte: s.startDate, lte: s.endDate } } });
    if (activities) throw new ConflictException(`Học kỳ này còn ${activities} hoạt động trong khoảng thời gian của nó nên không thể xóa.`);
    await this.prisma.semester.delete({ where: { id } });
    return { success: true };
  }

  // Ngày tính theo giờ Việt Nam: bắt đầu lúc 00:00 của ngày đầu, kết thúc lúc 23:59:59 của ngày cuối
  // (để hoạt động diễn ra ngày cuối kỳ vẫn thuộc học kỳ).
  private data(dto: SemesterDto) {
    return {
      name: dto.name,
      year: dto.year,
      startDate: new Date(`${dto.startDate.slice(0, 10)}T00:00:00+07:00`),
      endDate: new Date(`${dto.endDate.slice(0, 10)}T23:59:59.999+07:00`),
    };
  }

  private async validate(d: { name: string; year: string; startDate: Date; endDate: Date }, excludeId?: number) {
    const [y1, y2] = d.year.split('-').map(Number);
    if (y2 !== y1 + 1) throw new BadRequestException('Năm học phải gồm hai năm liên tiếp, ví dụ 2026-2027.');
    if (d.endDate <= d.startDate) throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu.');
    const months = (d.endDate.getTime() - d.startDate.getTime()) / (30 * 86400000);
    if (months > 6.5) throw new BadRequestException('Một học kỳ không kéo dài quá 6 tháng.');
    const inYear = (x: Date) => [y1, y2].includes(Number(x.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 4)));
    if (!inYear(d.startDate) || !inYear(d.endDate)) throw new BadRequestException(`Thời gian học kỳ phải nằm trong năm học ${d.year}.`);

    const others = { NOT: excludeId ? { id: excludeId } : undefined };
    const same = await this.prisma.semester.findFirst({ where: { name: d.name, year: d.year, ...others } });
    if (same) throw new ConflictException(`Đã có học kỳ ${d.name} năm học ${d.year}.`);
    const clash = await this.prisma.semester.findFirst({ where: { startDate: { lte: d.endDate }, endDate: { gte: d.startDate }, ...others } });
    if (clash) throw new ConflictException(`Thời gian bị trùng với ${clash.name} ${clash.year} (${this.vn(clash.startDate)} – ${this.vn(clash.endDate)}).`);
  }

  private vn(x: Date) {
    return x.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }

  private async ensure(id: number) {
    const s = await this.prisma.semester.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Không tìm thấy học kỳ.');
    return s;
  }
}
