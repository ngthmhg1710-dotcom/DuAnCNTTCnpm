import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';

type Rule = { action: string | ((req: any) => string); object: string; detail?: (req: any, res: any) => string };

const login: Rule = { action: 'LOGIN', object: 'Tài khoản', detail: (req) => String(req.body?.username ?? req.body?.email ?? '') };
const declAction: Record<string, string> = { receive: 'RECEIVE', approve: 'APPROVE', reject: 'REJECT', supplement: 'REQUEST_INFO' };

// Chỉ ghi các thao tác làm thay đổi dữ liệu/quyền. Key: "METHOD /đường-dẫn-route" (bỏ tiền tố /api).
const RULES: Record<string, Rule> = {
  'POST /auth/login': login,
  'POST /auth/oauth/google-direct': login,
  'POST /auth/oauth/google-token': login,
  'POST /auth/users': { action: 'CREATE', object: 'Tài khoản', detail: (req) => String(req.body?.username ?? '') },
  'PATCH /auth/users/:id': { action: (req) => (req.body?.status === 'INACTIVE' ? 'LOCK' : 'UPDATE'), object: 'Tài khoản', detail: (req) => (req.body?.status === 'INACTIVE' ? 'Khóa tài khoản' : '') },
  'DELETE /auth/users/:id': { action: 'DELETE', object: 'Tài khoản' },
  'POST /students/import': { action: 'IMPORT', object: 'Sinh viên', detail: (_r, res) => `Thêm ${res?.created ?? 0}, lỗi ${res?.errors?.length ?? 0}` },
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
    const user = req.session?.user ?? res?.user;
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
