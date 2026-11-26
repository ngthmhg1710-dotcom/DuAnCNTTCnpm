import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// CLASS/COHORT: danh sách lớp/khóa do admin nhập, dùng để chọn "đối tượng tham gia" của hoạt động.
export const CATEGORY_TYPES = ['ACTIVITY', 'UNIT', 'CRITERIA_GROUP', 'CLASS', 'COHORT'] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list(type: CategoryType) {
    await this.importExisting(type);
    const rows = await this.prisma.category.findMany({ where: { type }, orderBy: { name: 'asc' } });
    return Promise.all(rows.map(async (c) => ({ ...c, usage: await this.usage(type, c.name) })));
  }

  async create(type: CategoryType, name: string) {
    try {
      return await this.prisma.category.create({ data: { type, name } });
    } catch {
      throw new BadRequestException('Danh mục đã tồn tại.');
    }
  }

  // Đổi tên thì cập nhật luôn dữ liệu đang dùng tên cũ, để hoạt động/tiêu chí vẫn khớp nhóm.
  async rename(id: number, name: string) {
    const old = await this.ensure(id);
    if (old.name === name) return old;
    try {
      const [updated] = await this.prisma.$transaction([
        this.prisma.category.update({ where: { id }, data: { name } }),
        ...this.renameUsages(old.type as CategoryType, old.name, name),
      ]);
      return updated;
    } catch {
      throw new BadRequestException('Danh mục đã tồn tại.');
    }
  }

  async remove(id: number) {
    const c = await this.ensure(id);
    const type = c.type as CategoryType;
    if (type === 'CLASS' || type === 'COHORT') {
      // Lớp/khóa chỉ là danh sách lựa chọn: sinh viên thuộc lớp đó không bị ảnh hưởng, nhưng không xóa khi còn hoạt động nhắm tới.
      const targeted = await this.targeting(type, c.name);
      if (targeted) throw new BadRequestException(`Có ${targeted} hoạt động đang giới hạn theo ${type === 'CLASS' ? 'lớp' : 'khóa'} này, hãy bỏ khỏi hoạt động trước khi xóa.`);
    } else {
      const used = await this.usage(type, c.name);
      if (used) throw new BadRequestException(`Danh mục đang được dùng ở ${used} mục, hãy đổi sang danh mục khác trước khi xóa.`);
    }
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  private usage(type: CategoryType, name: string) {
    if (type === 'ACTIVITY') return this.prisma.activity.count({ where: { category: name } });
    if (type === 'UNIT') return this.prisma.activity.count({ where: { unit: name } });
    if (type === 'CLASS') return this.prisma.student.count({ where: { className: name } });
    if (type === 'COHORT') return this.prisma.student.count({ where: { cohort: name } });
    return this.prisma.criteria.count({ where: { group: name } });
  }

  // Số hoạt động đang giới hạn đối tượng theo lớp/khóa này.
  private targeting(type: 'CLASS' | 'COHORT', name: string) {
    return this.prisma.activity.count({ where: type === 'CLASS' ? { targetClasses: { has: name } } : { targetCohorts: { has: name } } });
  }

  private renameUsages(type: CategoryType, from: string, to: string): any[] {
    if (type === 'ACTIVITY') return [this.prisma.activity.updateMany({ where: { category: from }, data: { category: to } })];
    if (type === 'UNIT') return [this.prisma.activity.updateMany({ where: { unit: from }, data: { unit: to } })];
    // Đổi tên lớp/khóa: cập nhật cả sinh viên và danh sách đối tượng của hoạt động để vẫn khớp nhau.
    if (type === 'CLASS')
      return [
        this.prisma.student.updateMany({ where: { className: from }, data: { className: to } }),
        this.prisma.$executeRaw`UPDATE "Activity" SET "targetClasses" = array_replace("targetClasses", ${from}, ${to}) WHERE ${from} = ANY("targetClasses")`,
      ];
    if (type === 'COHORT')
      return [
        this.prisma.student.updateMany({ where: { cohort: from }, data: { cohort: to } }),
        this.prisma.$executeRaw`UPDATE "Activity" SET "targetCohorts" = array_replace("targetCohorts", ${from}, ${to}) WHERE ${from} = ANY("targetCohorts")`,
      ];
    return [this.prisma.criteria.updateMany({ where: { group: from }, data: { group: to } })];
  }

  // Lần đầu mở một loại danh mục: lấy các giá trị đang có trong dữ liệu làm danh mục ban đầu.
  private async importExisting(type: CategoryType) {
    if (type === 'CLASS' || type === 'COHORT') return; // do admin tự nhập, không lấy từ dữ liệu sinh viên
    if (await this.prisma.category.count({ where: { type } })) return;
    const names =
      type === 'ACTIVITY'
        ? (await this.prisma.activity.findMany({ select: { category: true }, distinct: ['category'] })).map((r) => r.category)
        : type === 'UNIT'
          ? (await this.prisma.activity.findMany({ select: { unit: true }, distinct: ['unit'] })).map((r) => r.unit)
          : (await this.prisma.criteria.findMany({ select: { group: true }, distinct: ['group'] })).map((r) => r.group);
    const data = names.filter((n): n is string => !!n?.trim()).map((name) => ({ type, name }));
    if (data.length) await this.prisma.category.createMany({ data, skipDuplicates: true });
  }

  private async ensure(id: number) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Không tìm thấy danh mục.');
    return c;
  }
}
