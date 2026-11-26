import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export const CATEGORY_TYPES = ['ACTIVITY', 'UNIT', 'CRITERIA_GROUP'] as const;
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
    const used = await this.usage(c.type as CategoryType, c.name);
    if (used) throw new BadRequestException(`Danh mục đang được dùng ở ${used} mục, hãy đổi sang danh mục khác trước khi xóa.`);
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  private usage(type: CategoryType, name: string) {
    if (type === 'ACTIVITY') return this.prisma.activity.count({ where: { category: name } });
    if (type === 'UNIT') return this.prisma.activity.count({ where: { unit: name } });
    return this.prisma.criteria.count({ where: { group: name } });
  }

  private renameUsages(type: CategoryType, from: string, to: string) {
    if (type === 'ACTIVITY') return [this.prisma.activity.updateMany({ where: { category: from }, data: { category: to } })];
    if (type === 'UNIT') return [this.prisma.activity.updateMany({ where: { unit: from }, data: { unit: to } })];
    return [this.prisma.criteria.updateMany({ where: { group: from }, data: { group: to } })];
  }

  // Lần đầu mở một loại danh mục: lấy các giá trị đang có trong dữ liệu làm danh mục ban đầu.
  private async importExisting(type: CategoryType) {
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
