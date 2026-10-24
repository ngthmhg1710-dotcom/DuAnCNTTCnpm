import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type Body = { name?: string; baseUrl?: string; authType?: string; apiKey?: string; isActive?: boolean };

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // apiKey không bao giờ trả về client
  private safe({ apiKey, ...i }: any) {
    return { ...i, hasKey: !!apiKey };
  }

  async list() {
    return (await this.prisma.integration.findMany({ orderBy: { id: 'asc' } })).map((i) => this.safe(i));
  }

  private data(b: Body) {
    const baseUrl = b.baseUrl?.trim();
    if (baseUrl && !/^https?:\/\//.test(baseUrl)) throw new BadRequestException('baseUrl phải bắt đầu bằng http(s)://');
    return { name: b.name?.trim(), baseUrl, authType: b.authType, apiKey: b.apiKey || undefined, isActive: b.isActive };
  }

  async create(b: Body) {
    if (!b.name?.trim() || !b.baseUrl?.trim()) throw new BadRequestException('Thiếu tên hoặc baseUrl');
    return this.safe(await this.prisma.integration.create({ data: this.data(b) as any }));
  }

  async update(id: number, b: Body) {
    await this.get(id);
    return this.safe(await this.prisma.integration.update({ where: { id }, data: this.data(b) }));
  }

  async remove(id: number) {
    await this.get(id);
    await this.prisma.integration.delete({ where: { id } });
    return { success: true };
  }

  private async get(id: number) {
    const i = await this.prisma.integration.findUnique({ where: { id } });
    if (!i) throw new NotFoundException('Không tìm thấy kết nối.');
    return i;
  }

  private async fetchStudents(i: { baseUrl: string; apiKey: string | null }) {
    const res = await fetch(`${i.baseUrl.replace(/\/$/, '')}/students`, {
      headers: i.apiKey ? { 'x-api-key': i.apiKey } : {},
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json())?.data;
    if (!Array.isArray(rows)) throw new Error('Phản hồi không có mảng "data"');
    return rows as any[];
  }

  async test(id: number) {
    const i = await this.get(id);
    try {
      const rows = await this.fetchStudents(i);
      return { ok: true, message: `Kết nối thành công, ${rows.length} bản ghi.` };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  }

  // Đồng bộ một chiều: cập nhật lớp/ngành của sinh viên đã có (khớp MSSV). MSSV lạ tính là lỗi.
  async sync(id: number) {
    const i = await this.get(id);
    if (!i.isActive) throw new BadRequestException('Kết nối đang tắt.');
    const t0 = Date.now();
    let records = 0, success = 0, failed = 0, error: string | null = null;
    try {
      const rows = await this.fetchStudents(i);
      records = rows.length;
      for (const r of rows) {
        const mssv = String(r.mssv ?? '').trim().toUpperCase();
        const done = mssv && (await this.prisma.student.updateMany({
          where: { mssv },
          data: { className: r.className ?? undefined, major: r.major ?? undefined },
        })).count;
        done ? success++ : failed++;
      }
    } catch (e: any) {
      error = e.message;
    }
    const status = error ? 'Thất bại' : failed ? 'Một phần' : 'Thành công';
    const log = await this.prisma.syncLog.create({
      data: { integrationId: id, records, success, failed, status, error, durationMs: Date.now() - t0 },
    });
    if (!error) await this.prisma.integration.update({ where: { id }, data: { lastSyncAt: log.startedAt } });
    return { ...log, integration: i.name };
  }

  async history() {
    const logs = await this.prisma.syncLog.findMany({ include: { integration: true }, orderBy: { id: 'desc' }, take: 200 });
    return logs.map(({ integration, ...l }) => ({ ...l, integration: integration.name }));
  }
}
