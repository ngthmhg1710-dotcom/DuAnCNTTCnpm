import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';

type Rule = { action: string | ((req: any) => string); object: string; detail?: (req: any, res: any) => string };

const login: Rule = { action: 'LOGIN', object: 'Tài khoản', detail: (req) => String(req.body?.username ?? req.body?.email ?? '') };
const declAction: Record<string, string> = { receive: 'RECEIVE', approve: 'APPROVE', reject: 'REJECT', supplement: 'REQUEST_INFO' };

const PART_LABEL: Record<string, string> = { REGISTERED: 'Đã đăng ký', ATTENDED: 'Đã tham gia', ABSENT: 'Vắng', CANCELLED: 'Hủy đăng ký' };

// Đổi trạng thái hoạt động (chỉ gửi cờ trạng thái) được ghi riêng để nhìn log biết ngay là công bố/đóng/hủy.
const STATE_KEYS = ['published', 'closed', 'cancelled'];
const isStateOnly = (b: any) => b && Object.keys(b).length > 0 && Object.keys(b).every((k) => STATE_KEYS.includes(k));
function activityAction(req: any) {
  const b = req.body ?? {};
  if (!isStateOnly(b)) return 'UPDATE';
  if (b.cancelled !== undefined) return b.cancelled ? 'CANCEL' : 'RESTORE';
  if (b.closed !== undefined) return b.closed ? 'CLOSE' : 'REOPEN';
  return b.published ? 'PUBLISH' : 'UNPUBLISH';
}
const activityDetail = (req: any) =>
  ({ CANCEL: 'Hủy hoạt động', RESTORE: 'Khôi phục hoạt động', CLOSE: 'Đóng đăng ký', REOPEN: 'Mở lại đăng ký', PUBLISH: 'Công bố', UNPUBLISH: 'Chuyển về nháp' } as Record<string, string>)[activityAction(req)] ?? String(req.body?.title ?? '');

// Chỉ ghi các thao tác làm thay đổi dữ liệu/quyền. Key: "METHOD /đường-dẫn-route" (bỏ tiền tố /api).
const RULES: Record<string, Rule> = {
  'POST /auth/login': login,
  'POST /auth/oauth/google-token': login,
  'POST /auth/users': { action: 'CREATE', object: 'Tài khoản', detail: (req) => String(req.body?.username ?? '') },
  'PATCH /auth/users/:id': { action: (req) => (req.body?.status === 'INACTIVE' ? 'LOCK' : req.body?.role ? 'CHANGE_ROLE' : 'UPDATE'), object: 'Tài khoản', detail: (req) => (req.body?.status === 'INACTIVE' ? 'Khóa tài khoản' : req.body?.role ? `Vai trò → ${req.body.role}` : '') },
  'DELETE /auth/users/:id': { action: 'DELETE', object: 'Tài khoản' },
  'POST /students/import': { action: 'IMPORT', object: 'Sinh viên', detail: (_r, res) => `Thêm ${res?.created ?? 0}, lỗi ${res?.errors?.length ?? 0}` },
  'POST /auth/logout': { action: 'REVOKE_TOKEN', object: 'Tài khoản', detail: () => 'Đăng xuất, thu hồi token' },
  'POST /activities': { action: 'CREATE', object: 'Hoạt động', detail: (req) => String(req.body?.title ?? '') },
  'PATCH /activities/:id': { action: activityAction, object: 'Hoạt động', detail: activityDetail },
  'DELETE /activities/:id': { action: 'DELETE', object: 'Hoạt động' },
  'POST /semesters': { action: 'CREATE', object: 'Học kỳ', detail: (req) => `${req.body?.name ?? ''} ${req.body?.year ?? ''}` },
  'PATCH /semesters/:id': { action: 'UPDATE', object: 'Học kỳ' },
  'POST /semesters/:id/current': { action: 'SET_CURRENT', object: 'Học kỳ' },
  'DELETE /semesters/:id': { action: 'DELETE', object: 'Học kỳ' },
  'POST /criteria': { action: 'CREATE', object: 'Tiêu chí', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /criteria/:id': { action: 'UPDATE', object: 'Tiêu chí' },
  'DELETE /criteria/:id': { action: 'DELETE', object: 'Tiêu chí' },
  'POST /categories': { action: 'CREATE', object: 'Danh mục', detail: (req) => `${req.body?.type ?? ''}: ${req.body?.name ?? ''}` },
  'PATCH /categories/:id': { action: 'UPDATE', object: 'Danh mục', detail: (req) => `Đổi tên → ${req.body?.name ?? ''}` },
  'DELETE /categories/:id': { action: 'DELETE', object: 'Danh mục' },
  'POST /notifications': { action: 'CREATE', object: 'Thông báo', detail: (req) => String(req.body?.title ?? '') },
  'POST /integrations': { action: 'CREATE', object: 'Tích hợp', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /integrations/:id': { action: 'UPDATE', object: 'Tích hợp' },
  'DELETE /integrations/:id': { action: 'DELETE', object: 'Tích hợp' },
  // Đối tác đẩy dữ liệu (không đăng nhập nên không có người thực hiện): ghi cả thành công lẫn bị từ chối.
  'POST /partner/ingest/:dataType': { action: 'PUSH', object: 'Tích hợp', detail: (req, res) => `Đối tác đẩy ${req.params?.dataType}: ${res ? `${res.success}/${res.records} bản ghi thành công, ${res.failed} lỗi` : 'bị từ chối'}` },
  'POST /integrations/errors/:id/retry': { action: 'RETRY', object: 'Tích hợp', detail: (_r, res) => `Thử lại bản ghi lỗi: ${res?.message ?? ''}` },
  'POST /integrations/sync-history/:id/retry': { action: 'RETRY', object: 'Tích hợp', detail: (_r, res) => `Thử lại lần đồng bộ: xử lý ${res?.resolved ?? 0}/${res?.total ?? 0}, còn lỗi ${res?.stillFailing ?? 0}` },
  'POST /integrations/:id/sync': { action: 'SYNC', object: 'Tích hợp', detail: (_r, res) => `${res?.status ?? ''}: ${res?.success ?? 0}/${res?.records ?? 0}` },
  'POST /roles': { action: 'CREATE', object: 'Vai trò', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /roles/:id': { action: 'UPDATE', object: 'Vai trò' },
  'DELETE /roles/:id': { action: 'DELETE', object: 'Vai trò' },
  // Điểm danh quyết định điểm rèn luyện nên mọi lần đổi trạng thái đều ghi: ai đổi, sinh viên nào, hoạt động nào, từ gì sang gì.
  'PATCH /participations/:id': {
    action: (req) => (req.body?.status === 'CANCELLED' ? 'CANCEL' : 'UPDATE'),
    object: 'Điểm danh',
    detail: (req, res) =>
      `${PART_LABEL[res?.previousStatus] ?? '?'} → ${PART_LABEL[req.body?.status] ?? String(req.body?.status ?? '')}${res?.mssv ? ` · ${res.mssv}` : ''}${res?.activityTitle ? ` · ${res.activityTitle}` : ''}`,
  },
  'POST /participations/import': { action: 'IMPORT', object: 'Điểm danh', detail: (req, res) => `HĐ ${req.body?.activityId}: cập nhật ${res?.updated ?? 0}, thêm ${res?.created ?? 0}, lỗi ${res?.errors?.length ?? 0}` },
  'POST /participations': { action: 'REGISTER', object: 'Hoạt động' },
  'DELETE /participations/:activityId': { action: 'CANCEL', object: 'Hoạt động' },
  'POST /declarations': { action: 'CREATE', object: 'Minh chứng', detail: (req) => String(req.body?.activityName ?? '') },
  'PATCH /declarations/:code': { action: (req) => declAction[req.body?.action] ?? 'UPDATE', object: 'Minh chứng', detail: (req) => String(req.body?.note ?? '') },
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const rule = RULES[`${req.method} ${String(req.route?.path ?? '').replace(/^\/api/, '')}`];
    if (!rule) return next.handle();
    return next.handle().pipe(
      tap({
        next: (res) => this.write(req, rule, 'SUCCESS', res),
        error: () => this.write(req, rule, 'FAILED'),
      }),
    );
  }

  private write(req: any, rule: Rule, status: string, res?: any) {
    const user = req.user ?? res?.user;
    const detail = rule.detail?.(req, res) || null;
    return this.prisma.auditLog
      .create({
        data: {
          userId: typeof user?.id === 'number' ? user.id : null,
          action: typeof rule.action === 'function' ? rule.action(req) : rule.action,
          object: rule.object,
          objectId: String(req.params?.id ?? req.params?.code ?? req.params?.activityId ?? req.body?.activityId ?? res?.id ?? '') || null,
          status,
          detail,
        },
      })
      .catch(() => {}); // ghi log lỗi không được làm hỏng request chính
  }
}
