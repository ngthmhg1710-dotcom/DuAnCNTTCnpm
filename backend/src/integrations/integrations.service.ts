import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { attendanceBlocked, audienceError } from '../common/participation-rules';

type Body = { name?: string; baseUrl?: string; authType?: string; dataType?: string; apiKey?: string; isActive?: boolean };
type Row = Record<string, any>;

export const DATA_TYPES = ['STUDENTS', 'ACTIVITIES', 'PARTICIPATIONS', 'DECLARATIONS'] as const;
type DataType = (typeof DATA_TYPES)[number];
const PATH: Record<DataType, string> = { STUDENTS: 'students', ACTIVITIES: 'activities', PARTICIPATIONS: 'participations', DECLARATIONS: 'declarations' };

const PARTICIPATION_STATUSES = ['REGISTERED', 'ATTENDED', 'ABSENT'];
const DECLARATION_STATUSES = ['PROCESSING', 'VERIFIED', 'NEEDS_MORE_INFO', 'REJECTED'];
const MAX_PUSH_ROWS = 1000; // ponytail: chưa giới hạn tần suất gọi (rate limit); thêm khi mở cho đối tác thật
const MAX_STORED_ERRORS = 500; // ponytail: chỉ lưu 500 dòng lỗi đầu mỗi lần đồng bộ; số lỗi thật vẫn nằm ở SyncLog.failed

// Lỗi của một dòng dữ liệu (sai định dạng, không khớp, vi phạm quy tắc): ghi lại lý do, không làm hỏng cả lần đồng bộ.
class RowError extends Error {}
const fail = (reason: string): never => { throw new RowError(reason); };

const text = (v: unknown) => (v == null ? '' : String(v).trim());
const isDate = (v: unknown) => v != null && v !== '' && !isNaN(+new Date(v as any));

// Mỗi loại dữ liệu đi qua 4 bước: validate (định dạng) → map (chuẩn hóa) → decide (quy tắc nghiệp vụ, tra DB) → write (ghi DB).
type Pipeline<M = any, Op = any> = {
  key: (r: Row) => string;
  validate: (r: Row) => void;
  map: (r: Row) => M;
  decide: (m: M, ctx: { integration: string }) => Promise<Op>;
  write: (op: Op) => Promise<void>;
};

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
    if (b.dataType && !(DATA_TYPES as readonly string[]).includes(b.dataType)) throw new BadRequestException(`dataType không hợp lệ (${DATA_TYPES.join(' | ')})`);
    return { name: b.name?.trim(), baseUrl, authType: b.authType, dataType: b.dataType, apiKey: b.apiKey || undefined, isActive: b.isActive };
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

  private async fetchRows(i: { baseUrl: string; apiKey: string | null; authType: string; dataType: string }) {
    const headers: Record<string, string> = !i.apiKey ? {} : i.authType === 'BEARER' ? { Authorization: `Bearer ${i.apiKey}` } : { 'x-api-key': i.apiKey };
    const path = PATH[i.dataType as DataType] ?? 'students';
    const res = await fetch(`${i.baseUrl.replace(/\/$/, '')}/${path}`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 401 || res.status === 403) throw new Error(`Đối tác từ chối xác thực (HTTP ${res.status}), kiểm tra lại API key`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let body: any;
    try { body = await res.json(); } catch { throw new Error('Phản hồi không phải JSON hợp lệ'); }
    const rows = body?.data;
    if (!Array.isArray(rows)) throw new Error('Phản hồi không có mảng "data"');
    return rows as any[];
  }

  async test(id: number) {
    const i = await this.get(id);
    try {
      const rows = await this.fetchRows(i);
      return { ok: true, message: `Kết nối thành công, ${rows.length} bản ghi.` };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  }

  // ---------- Luồng xử lý từng loại dữ liệu ----------

  private pipelines: Record<DataType, Pipeline> = {
    // Sinh viên: có MSSV thì cập nhật lớp/ngành; chưa có thì tạo tài khoản mới (cần họ tên).
    STUDENTS: {
      key: (r) => text(r.mssv).toUpperCase(),
      validate: (r) => {
        if (!text(r.mssv)) fail('Thiếu MSSV');
        if (!/^[A-Za-z0-9._-]{3,30}$/.test(text(r.mssv))) fail(`MSSV "${text(r.mssv)}" sai định dạng`);
        if (text(r.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(r.email))) fail(`Email "${text(r.email)}" sai định dạng`);
      },
      map: (r) => ({ mssv: text(r.mssv).toUpperCase(), name: text(r.name), email: text(r.email).toLowerCase(), className: text(r.className) || undefined, major: text(r.major) || undefined }),
      decide: async (m) => {
        const student = await this.prisma.student.findUnique({ where: { mssv: m.mssv } });
        if (student) return { kind: 'update', id: student.id, data: { className: m.className, major: m.major } };
        if (!m.name) return fail(`MSSV ${m.mssv} chưa có trong hệ thống và dòng dữ liệu thiếu họ tên nên không tạo mới được`);
        const email = m.email || `${m.mssv.toLowerCase()}@student.tdtu.edu.vn`;
        if (await this.prisma.user.findFirst({ where: { OR: [{ username: m.mssv }, { email }] } })) return fail(`Email ${email} hoặc tên đăng nhập ${m.mssv} đã thuộc tài khoản khác`);
        return { kind: 'create', m, email };
      },
      write: async (op) => {
        if (op.kind === 'update') await this.prisma.student.update({ where: { id: op.id }, data: op.data });
        else await this.prisma.user.create({ data: { username: op.m.mssv, email: op.email, name: op.m.name, student: { create: { mssv: op.m.mssv, className: op.m.className, major: op.m.major } } } });
      },
    },

    // Hoạt động: khớp theo externalId. Tạo mới ở trạng thái NHÁP để cán bộ gắn mục quy chế/điểm trước khi công bố;
    // cập nhật chỉ đụng phần đối tác sở hữu (tên, thời gian, địa điểm...), không ghi đè phần cán bộ đã chỉnh (loại, điểm, ảnh, trạng thái).
    ACTIVITIES: {
      key: (r) => text(r.externalId),
      validate: (r) => {
        if (!text(r.externalId)) fail('Thiếu externalId');
        if (!text(r.title)) fail('Thiếu tên hoạt động (title)');
        if (!isDate(r.startAt)) fail(`startAt "${text(r.startAt)}" không phải ngày giờ hợp lệ`);
        if (r.endAt && !isDate(r.endAt)) fail(`endAt "${text(r.endAt)}" không phải ngày giờ hợp lệ`);
        if (r.endAt && +new Date(r.endAt) <= +new Date(r.startAt)) fail('endAt phải sau startAt');
        if (r.capacity != null && !(Number.isInteger(r.capacity) && r.capacity > 0)) fail('capacity phải là số nguyên lớn hơn 0');
      },
      map: (r) => ({
        externalId: text(r.externalId), title: text(r.title), startAt: new Date(r.startAt), endAt: r.endAt ? new Date(r.endAt) : null,
        category: text(r.category) || 'Khác', unit: text(r.unit) || null, location: text(r.location) || null, description: text(r.description) || null,
        capacity: r.capacity ?? null,
      }),
      decide: async (m) => {
        const existing = await this.prisma.activity.findUnique({ where: { externalId: m.externalId } });
        const { externalId, category, ...partnerOwned } = m;
        return existing ? { kind: 'update', id: existing.id, data: partnerOwned } : { kind: 'create', data: { externalId, category, ...partnerOwned, published: false } };
      },
      write: async (op) => {
        if (op.kind === 'update') await this.prisma.activity.update({ where: { id: op.id }, data: op.data });
        else await this.prisma.activity.create({ data: op.data });
      },
    },

    // Tham gia: cập nhật trạng thái của (MSSV, hoạt động). Gửi lại cùng dữ liệu không tạo bản ghi trùng.
    PARTICIPATIONS: {
      key: (r) => `${text(r.mssv).toUpperCase()}@${text(r.activityExternalId ?? r.externalId)}`,
      validate: (r) => {
        if (!text(r.mssv)) fail('Thiếu MSSV');
        if (!text(r.activityExternalId ?? r.externalId)) fail('Thiếu activityExternalId (mã hoạt động của đối tác)');
        if (r.status != null && !PARTICIPATION_STATUSES.includes(text(r.status))) fail(`Trạng thái "${text(r.status)}" không hợp lệ (${PARTICIPATION_STATUSES.join(' | ')})`);
      },
      map: (r) => ({ mssv: text(r.mssv).toUpperCase(), externalId: text(r.activityExternalId ?? r.externalId), status: text(r.status) || 'REGISTERED' }),
      decide: async (m) => {
        const student = await this.prisma.student.findUnique({ where: { mssv: m.mssv } });
        if (!student) return fail(`Không tìm thấy sinh viên ${m.mssv}`);
        const activity = await this.prisma.activity.findUnique({ where: { externalId: m.externalId }, include: { _count: { select: { participations: true } } } });
        if (!activity) return fail(`Không tìm thấy hoạt động ${m.externalId}`);
        if (activity.cancelled) return fail('Hoạt động đã bị hủy');
        const attending = m.status === 'ATTENDED' || m.status === 'ABSENT';
        if (attending) { const blocked = attendanceBlocked(activity); if (blocked) return fail(blocked); }
        const existing = await this.prisma.participation.findUnique({ where: { studentId_activityId: { studentId: student.id, activityId: activity.id } } });
        if (existing) return { kind: 'update', existing, status: m.status };
        const notInAudience = audienceError(activity, student);
        if (notInAudience) return fail(`${m.mssv} không thuộc đối tượng. ${notInAudience}`);
        if (activity.capacity && activity._count.participations >= activity.capacity) return fail(`Hoạt động đã đủ ${activity.capacity} người`);
        return { kind: 'create', studentId: student.id, activityId: activity.id, status: m.status };
      },
      write: async (op) => {
        if (op.kind === 'update') {
          if (op.existing.status === op.status) return; // gửi lại cùng trạng thái: không đổi gì
          await this.prisma.participation.update({ where: { id: op.existing.id }, data: { status: op.status, joinedAt: op.status === 'ATTENDED' ? op.existing.joinedAt ?? new Date() : null } });
        } else {
          await this.prisma.participation.create({ data: { studentId: op.studentId, activityId: op.activityId, status: op.status, joinedAt: op.status === 'ATTENDED' ? new Date() : null } });
        }
      },
    },

    // Khai báo: cập nhật trạng thái xử lý theo mã khai báo.
    DECLARATIONS: {
      key: (r) => text(r.code),
      validate: (r) => {
        if (!text(r.code)) fail('Thiếu mã khai báo (code)');
        if (!DECLARATION_STATUSES.includes(text(r.status))) fail(`Trạng thái "${text(r.status)}" không hợp lệ (${DECLARATION_STATUSES.join(' | ')})`);
      },
      map: (r) => ({ code: text(r.code), status: text(r.status), note: text(r.note) }),
      decide: async (m, ctx) => {
        const decl = await this.prisma.declaration.findUnique({ where: { code: m.code } });
        if (!decl) return fail(`Không tìm thấy khai báo ${m.code}`);
        if ((m.status === 'REJECTED' || m.status === 'NEEDS_MORE_INFO') && !m.note) return fail('Cần ghi chú (note) khi từ chối hoặc yêu cầu bổ sung');
        return { kind: 'update', decl, m, handler: `Đối tác: ${ctx.integration}` };
      },
      write: async (op) => {
        if (op.decl.status === op.m.status) return; // gửi lại cùng trạng thái: không đổi gì
        await this.prisma.declaration.update({ where: { id: op.decl.id }, data: { status: op.m.status, handler: op.handler, reviewNote: op.m.note || op.decl.reviewNote } });
      },
    },
  };

  // Chạy một dòng qua 4 bước. Trả về lý do lỗi, hoặc null nếu thành công.
  private async runRow(type: string, integrationName: string, row: Row): Promise<string | null> {
    const p = this.pipelines[type as DataType] ?? this.pipelines.STUDENTS;
    try {
      if (row == null || typeof row !== 'object' || Array.isArray(row)) fail('Bản ghi phải là một đối tượng JSON');
      p.validate(row);
      const op = await p.decide(p.map(row), { integration: integrationName });
      await p.write(op);
      return null;
    } catch (e: any) {
      return e instanceof RowError ? e.message : `Lỗi hệ thống: ${String(e?.message ?? e).split('\n').pop()?.slice(0, 160)}`;
    }
  }

  private keyOf(type: string, row: Row) {
    try { return (this.pipelines[type as DataType] ?? this.pipelines.STUDENTS).key(row ?? {}) || null; } catch { return null; }
  }

  // ---------- Đồng bộ, lịch sử, thử lại ----------

  private statusOf(error: string | null, failed: number) {
    return error ? 'Thất bại' : failed ? 'Một phần' : 'Thành công';
  }

  // Kéo: hệ thống gọi đối tác lấy dữ liệu.
  async sync(id: number) {
    const i = await this.get(id);
    if (!i.isActive) throw new BadRequestException('Kết nối đang tắt.');
    const { log } = await this.run(i, 'Kéo', () => this.fetchRows(i));
    return { ...log, integration: i.name };
  }

  // Đẩy: đối tác gọi POST /partner/ingest/:dataType kèm x-api-key. Khóa được đối chiếu với các kết nối đã cấu hình.
  // 401 = thiếu/sai khóa; 403 = khóa đúng nhưng không được cấp cho loại dữ liệu này hoặc kết nối đang tắt.
  async ingest(slug: string, apiKey: string | undefined, body: any) {
    const type = (Object.keys(PATH) as DataType[]).find((t) => PATH[t] === slug);
    if (!type) throw new NotFoundException(`Loại dữ liệu không hợp lệ. Dùng: ${Object.values(PATH).join(' | ')}`);
    if (!apiKey) throw new UnauthorizedException('Thiếu API key (header x-api-key).');
    const matches = await this.prisma.integration.findMany({ where: { apiKey } });
    if (!matches.length) throw new UnauthorizedException('API Key không hợp lệ.');
    const i = matches.find((m) => m.dataType === type);
    if (!i) throw new ForbiddenException(`API key này chưa được cấp cho dữ liệu "${slug}".`);
    if (!i.isActive) throw new ForbiddenException('Kết nối đang tắt.');

    const rows = body?.data;
    if (!Array.isArray(rows)) throw new BadRequestException('Body phải có dạng { "data": [ ... ] }.');
    if (!rows.length) throw new BadRequestException('Mảng "data" đang rỗng.');
    if (rows.length > MAX_PUSH_ROWS) throw new BadRequestException(`Tối đa ${MAX_PUSH_ROWS} bản ghi mỗi lần gửi.`);

    const { log, rowErrors } = await this.run(i, 'Đẩy', async () => rows);
    const result = {
      syncLogId: log.id,
      dataType: slug,
      status: log.status,
      records: log.records,
      success: log.success,
      failed: log.failed,
      errors: rowErrors.slice(0, 50).map(({ rowIndex, key, reason }) => ({ row: rowIndex, key, reason })),
    };
    // Toàn bộ bản ghi đều bị từ chối: trả 422 để đối tác biết ngay là chưa có gì được ghi.
    if (log.success === 0 && log.failed > 0) throw new UnprocessableEntityException(result);
    return result;
  }

  // Phần lõi dùng chung cho kéo và đẩy: chạy từng dòng qua 4 bước, ghi lịch sử, lỗi từng dòng và thông báo cán bộ.
  private async run(i: { id: number; name: string; dataType: string }, source: 'Kéo' | 'Đẩy', getRows: () => Promise<any[]>) {
    const id = i.id;
    const t0 = Date.now();
    let records = 0, success = 0, failed = 0, error: string | null = null;
    const rowErrors: { rowIndex: number; key: string | null; reason: string; raw: any }[] = [];
    try {
      const rows = await getRows();
      records = rows.length;
      for (const [idx, r] of rows.entries()) {
        const reason = await this.runRow(i.dataType, i.name, r);
        if (!reason) { success++; continue; }
        failed++;
        if (rowErrors.length < MAX_STORED_ERRORS) rowErrors.push({ rowIndex: idx + 1, key: this.keyOf(i.dataType, r), reason, raw: r ?? null });
      }
    } catch (e: any) {
      error = e.message;
    }
    const status = this.statusOf(error, failed);
    const log = await this.prisma.syncLog.create({
      data: { integrationId: id, source, records, success, failed, status, error, durationMs: Date.now() - t0 },
    });
    if (rowErrors.length) await this.prisma.syncError.createMany({ data: rowErrors.map((e) => ({ ...e, syncLogId: log.id })) });
    if (!error) await this.prisma.integration.update({ where: { id }, data: { lastSyncAt: log.startedAt } });
    if (status !== 'Thành công') await this.notifyStaff(i.name, log.id, status, error, failed, records, source);
    return { log, rowErrors };
  }

  // Đồng bộ lỗi: báo cho tất cả cán bộ (mỗi người một thông báo).
  private async notifyStaff(name: string, logId: number, status: string, error: string | null, failed: number, records: number, source: 'Kéo' | 'Đẩy' = 'Kéo') {
    const staff = await this.prisma.user.findMany({ where: { role: 'STAFF', status: 'ACTIVE' }, select: { id: true } });
    if (!staff.length) return;
    const detail = error ? `Lỗi: ${error}.` : `${failed}/${records} bản ghi bị lỗi.`;
    await this.prisma.notification.createMany({
      data: staff.map((u) => ({
        userId: u.id,
        batchId: `sync-${logId}`,
        title: status === 'Thất bại' ? `Đồng bộ "${name}" thất bại` : `Đồng bộ "${name}" có bản ghi lỗi`,
        message: `${detail} ${source === 'Đẩy' ? 'Dữ liệu do đối tác gửi tới. ' : ''}Vui lòng báo quản trị viên kiểm tra mục Đồng bộ dữ liệu (lần đồng bộ #${logId}).`,
        type: 'Đồng bộ',
      })),
    }).catch(() => null); // lỗi gửi thông báo không được làm hỏng lần đồng bộ
  }

  async history() {
    const logs = await this.prisma.syncLog.findMany({
      include: { integration: true, _count: { select: { errors: { where: { resolved: false } } } } },
      orderBy: { id: 'desc' },
      take: 200,
    });
    return logs.map(({ integration, _count, ...l }) => ({ ...l, integration: integration.name, dataType: integration.dataType, openErrors: _count.errors }));
  }

  async errors(logId: number) {
    if (!(await this.prisma.syncLog.findUnique({ where: { id: logId } }))) throw new NotFoundException('Không tìm thấy lần đồng bộ.');
    return this.prisma.syncError.findMany({ where: { syncLogId: logId }, orderBy: { rowIndex: 'asc' } });
  }

  // Thử lại một bản ghi lỗi (dùng lại dữ liệu gốc đã lưu). Thành công thì đánh dấu đã xử lý và cập nhật số liệu của lần đồng bộ.
  async retryError(errorId: number) {
    const err = await this.prisma.syncError.findUnique({ where: { id: errorId }, include: { syncLog: { include: { integration: true } } } });
    if (!err) throw new NotFoundException('Không tìm thấy bản ghi lỗi.');
    if (err.resolved) return { resolved: true, reason: null, message: 'Bản ghi này đã được xử lý.' };
    const { integration } = err.syncLog;
    const reason = await this.runRow(integration.dataType, integration.name, err.raw as Row);
    if (!reason) {
      await this.prisma.syncError.update({ where: { id: errorId }, data: { resolved: true, attempts: { increment: 1 } } });
      const log = await this.prisma.syncLog.update({ where: { id: err.syncLogId }, data: { failed: { decrement: 1 }, success: { increment: 1 } } });
      await this.prisma.syncLog.update({ where: { id: log.id }, data: { status: this.statusOf(log.error, log.failed) } });
      return { resolved: true, reason: null, message: 'Đã xử lý thành công.' };
    }
    await this.prisma.syncError.update({ where: { id: errorId }, data: { reason, attempts: { increment: 1 } } });
    return { resolved: false, reason, message: `Vẫn lỗi: ${reason}` };
  }

  // Thử lại tất cả bản ghi lỗi chưa xử lý của một lần đồng bộ.
  async retryLog(logId: number) {
    const open = await this.prisma.syncError.findMany({ where: { syncLogId: logId, resolved: false }, orderBy: { rowIndex: 'asc' }, select: { id: true } });
    if (!open.length && !(await this.prisma.syncLog.findUnique({ where: { id: logId } }))) throw new NotFoundException('Không tìm thấy lần đồng bộ.');
    let resolved = 0;
    for (const { id } of open) if ((await this.retryError(id)).resolved) resolved++;
    return { total: open.length, resolved, stillFailing: open.length - resolved };
  }
}
