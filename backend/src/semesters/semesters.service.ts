import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.present(await this.prisma.semester.create({ data: this.data(dto) }));
  }

  async update(id: number, dto: SemesterDto) {
    await this.ensure(id);
    return this.present(await this.prisma.semester.update({ where: { id }, data: this.data(dto) }));
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
    await this.ensure(id);
    await this.prisma.semester.delete({ where: { id } });
    return { success: true };
  }

  private data(dto: SemesterDto) {
    return { name: dto.name, year: dto.year, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) };
  }

  private async ensure(id: number) {
    if (!(await this.prisma.semester.findUnique({ where: { id } }))) throw new NotFoundException('Không tìm thấy học kỳ.');
  }
}
