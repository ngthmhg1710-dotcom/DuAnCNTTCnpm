import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';

type Rule = { action: string | ((req: any) => string); object: string; detail?: (req: any, res: any) => string };

const login: Rule = { action: 'LOGIN', object: 'Tài khoản', detail: (req) => String(req.body?.username ?? req.body?.email ?? '') };
const declAction: Record<string, string> = { receive: 'RECEIVE', approve: 'APPROVE', reject: 'REJECT', supplement: 'REQUEST_INFO' };

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
  'PATCH /activities/:id': { action: 'UPDATE', object: 'Hoạt động', detail: (req) => String(req.body?.title ?? '') },
  'DELETE /activities/:id': { action: 'DELETE', object: 'Hoạt động' },
  'POST /semesters': { action: 'CREATE', object: 'Học kỳ', detail: (req) => `${req.body?.name ?? ''} ${req.body?.year ?? ''}` },
  'PATCH /semesters/:id': { action: 'UPDATE', object: 'Học kỳ' },
  'POST /semesters/:id/current': { action: 'SET_CURRENT', object: 'Học kỳ' },
  'DELETE /semesters/:id': { action: 'DELETE', object: 'Học kỳ' },
  'POST /criteria': { action: 'CREATE', object: 'Tiêu chí', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /criteria/:id': { action: 'UPDATE', object: 'Tiêu chí' },
  'DELETE /criteria/:id': { action: 'DELETE', object: 'Tiêu chí' },
  'POST /notifications': { action: 'CREATE', object: 'Thông báo', detail: (req) => String(req.body?.title ?? '') },
  'POST /integrations': { action: 'CREATE', object: 'Tích hợp', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /integrations/:id': { action: 'UPDATE', object: 'Tích hợp' },
  'DELETE /integrations/:id': { action: 'DELETE', object: 'Tích hợp' },
  'POST /integrations/:id/sync': { action: 'SYNC', object: 'Tích hợp', detail: (_r, res) => `${res?.status ?? ''}: ${res?.success ?? 0}/${res?.records ?? 0}` },
  'POST /roles': { action: 'CREATE', object: 'Vai trò', detail: (req) => String(req.body?.name ?? '') },
  'PATCH /roles/:id': { action: 'UPDATE', object: 'Vai trò' },
  'DELETE /roles/:id': { action: 'DELETE', object: 'Vai trò' },
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
