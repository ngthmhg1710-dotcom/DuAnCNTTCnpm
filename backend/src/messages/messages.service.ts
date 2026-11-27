import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { AlertsService } from '../alerts/alerts.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { SendMessageDto } from './messages.dto';

const when = (d: Date) => d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

export const DEFAULT_SUBJECT = 'Nhắc tham gia: {hoatdong}';
export const DEFAULT_BODY = 'Chào {ten},\n\nBạn đã đăng ký hoạt động "{hoatdong}".\nThời gian: {thoigian}\nĐịa điểm: {diadiem}\n\nVui lòng có mặt đúng giờ để được điểm danh và ghi nhận điểm rèn luyện.';

export const TEMPLATES = [
  { id: 'upcoming', name: 'Nhắc tham gia hoạt động sắp diễn ra', subject: DEFAULT_SUBJECT, body: DEFAULT_BODY },
  { id: 'attendance', name: 'Nhắc điểm danh', subject: 'Nhắc điểm danh: {hoatdong}', body: 'Chào {ten},\n\nHoạt động "{hoatdong}" diễn ra lúc {thoigian}. Bạn nhớ đến sớm và điểm danh với cán bộ để được ghi nhận điểm rèn luyện.' },
  { id: 'change', name: 'Thông báo thay đổi hoạt động', subject: 'Thay đổi thông tin: {hoatdong}', body: 'Chào {ten},\n\nHoạt động "{hoatdong}" có thay đổi: [ghi nội dung thay đổi ở đây].\nThời gian: {thoigian}\nĐịa điểm: {diadiem}' },
  { id: 'free', name: 'Tự soạn nội dung', subject: '', body: '' },
];

type Act = { id: number; title: string; startAt: Date; location: string | null };
type Recipient = { studentId: number; userId: number; mssv: string; name: string; email: string | null; acts: Act[] };

// Điền {ten} {hoatdong} {thoigian} {diadiem}. Sinh viên có nhiều hoạt động thì liệt kê từng hoạt động.
function fill(text: string, r: Recipient) {
  const one = r.acts.length === 1;
  const vars: Record<string, string> = {
    ten: r.name,
    hoatdong: r.acts.map((a) => a.title).join(', '),
    thoigian: one ? when(r.acts[0].startAt) : r.acts.map((a) => `${a.title}: ${when(a.startAt)}`).join('; '),
    diadiem: one ? r.acts[0].location || 'sẽ thông báo sau' : r.acts.map((a) => `${a.title}: ${a.location || 'sẽ thông báo sau'}`).join('; '),
  };
  return text.replace(/\{(ten|hoatdong|thoigian|diadiem)\}/g, (_m, k) => vars[k]);
}

// Chạy tối đa `limit` việc cùng lúc.
async function pool<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService, private mail: MailService, private alerts: AlertsService, private analytics: AnalyticsService) {}

  templates() {
    return TEMPLATES;
  }

  status() {
    return { emailProvider: this.mail.provider(), emailFrom: this.mail.provider() === 'dry-run' ? '(chạy thử, không gửi thật)' : this.mail.from() || null };
  }

  // Sinh viên của các hoạt động đã chọn (mọi trạng thái đăng ký), kèm hoạt động họ tham gia trong số đó.
  async audience(activityIds: number[]) {
    if (!activityIds.length) return [];
    const parts = await this.prisma.participation.findMany({
      where: { activityId: { in: activityIds } },
      include: { activity: { select: { id: true, title: true, startAt: true, location: true } }, student: { include: { user: { select: { name: true, email: true, status: true } } } } },
      orderBy: { student: { mssv: 'asc' } },
    });
    const byStudent = new Map<number, any>();
    for (const p of parts) {
      const cur = byStudent.get(p.studentId) ?? {
        studentId: p.studentId, mssv: p.student.mssv, name: p.student.user.name, className: p.student.className, cohort: p.student.cohort,
        email: p.student.user.email, active: p.student.user.status === 'ACTIVE', activities: [],
      };
      cur.activities.push({ id: p.activity.id, title: p.activity.title, status: p.status });
      byStudent.set(p.studentId, cur);
    }
    return [...byStudent.values()];
  }

  // Gửi theo lựa chọn của cán bộ: nhiều hoạt động, nhiều sinh viên. Chỉ gửi cho sinh viên thật sự thuộc các hoạt động đã chọn.
  async send(dto: SendMessageDto, senderId: number) {
    if (!dto.app && !dto.email) throw new BadRequestException('Chọn ít nhất một kênh gửi: thông báo trong hệ thống hoặc email.');
    if (dto.email && !this.mail.provider()) throw new BadRequestException('Chưa cấu hình gửi email trên server. Xem hướng dẫn cấu hình email hoặc chỉ chọn thông báo trong hệ thống.');

    const activityIds = [...new Set(dto.activityIds)];
    const studentIds = [...new Set(dto.studentIds)];
    const parts = await this.prisma.participation.findMany({
      where: { activityId: { in: activityIds }, studentId: { in: studentIds } },
      include: { activity: { select: { id: true, title: true, startAt: true, location: true } }, student: { include: { user: { select: { id: true, name: true, email: true, status: true } } } } },
    });
    const map = new Map<number, Recipient>();
    for (const p of parts) {
      if (p.student.user.status !== 'ACTIVE') continue;
      const r = map.get(p.studentId) ?? { studentId: p.studentId, userId: p.student.user.id, mssv: p.student.mssv, name: p.student.user.name, email: p.student.user.email, acts: [] };
      r.acts.push(p.activity);
      map.set(p.studentId, r);
    }
    const recipients = [...map.values()].map((r) => ({ ...r, acts: r.acts.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()) }));
    if (!recipients.length) throw new BadRequestException('Không có sinh viên hợp lệ thuộc các hoạt động đã chọn.');

    return { ...(await this.deliver(recipients, dto.subject, dto.body, { app: dto.app, email: dto.email, senderId, activityIds })), ignored: studentIds.length - recipients.length };
  }

  private async deliver(recipients: Recipient[], subject: string, body: string, o: { app: boolean; email: boolean; senderId?: number; activityIds: number[] }) {
    let app = 0;
    if (o.app) {
      const batchId = randomUUID();
      const createdAt = new Date();
      const link = o.activityIds.length === 1 ? `/student/activities/${o.activityIds[0]}` : '/student/registered';
      await this.prisma.notification.createMany({
        data: recipients.map((r) => ({ userId: r.userId, senderId: o.senderId, batchId, createdAt, title: fill(subject, r), message: fill(body, r), type: 'Nhắc nhở', link })),
      });
      app = recipients.length;
    }
    let email = 0;
    const emailFailed: { mssv: string; reason: string }[] = [];
    if (o.email) {
      await pool(recipients, 5, async (r) => {
        if (!r.email) { emailFailed.push({ mssv: r.mssv, reason: 'Không có địa chỉ email' }); return; }
        const m = await this.mail.send(r.email, fill(subject, r), fill(body, r));
        if (m.ok) email++; else emailFailed.push({ mssv: r.mssv, reason: m.error || 'Lỗi không rõ' });
      });
    }
    return { students: recipients.length, app, email, emailFailed: emailFailed.slice(0, 20), emailFailedCount: emailFailed.length };
  }

  // Việc chạy định kỳ (GitHub Actions gọi mỗi giờ): nhắc sinh viên đã đăng ký khi hoạt động sắp diễn ra + nhắc tiêu chí hằng ngày nếu bật.
  async runDue() {
    const now = new Date();
    const candidates = await this.prisma.activity.findMany({
      where: { published: true, cancelled: false, remindBeforeHours: { not: null }, remindedAt: null, startAt: { gt: now } },
      include: { participations: { where: { status: 'REGISTERED' }, include: { student: { include: { user: { select: { id: true, name: true, email: true, status: true } } } } } } },
    });
    const activities: { id: number; title: string; students: number; emailed: number }[] = [];
    for (const a of candidates) {
      if (a.startAt.getTime() - now.getTime() > (a.remindBeforeHours as number) * 3600000) continue; // chưa đến giờ nhắc
      const recipients: Recipient[] = a.participations
        .filter((p) => p.student.user.status === 'ACTIVE')
        .map((p) => ({ studentId: p.studentId, userId: p.student.user.id, mssv: p.student.mssv, name: p.student.user.name, email: p.student.user.email, acts: [a] }));
      if (!recipients.length) continue; // chưa ai đăng ký: để lần chạy sau (người đăng ký muộn vẫn được nhắc)
      const text = a.remindMessage?.trim() || DEFAULT_BODY;
      const r = await this.deliver(recipients, DEFAULT_SUBJECT, text, { app: true, email: a.remindEmail && !!this.mail.provider(), activityIds: [a.id] });
      await this.prisma.activity.update({ where: { id: a.id }, data: { remindedAt: now } });
      activities.push({ id: a.id, title: a.title, students: r.students, emailed: r.email });
    }

    let criteria: unknown = null;
    const settings = await this.alerts.getReminders();
    if (settings.auto) {
      try {
        criteria = await this.analytics.sendReminders(undefined, settings.email);
      } catch (e: any) {
        criteria = { error: String(e?.message ?? e) };
      }
    }
    return { ranAt: now.toISOString(), activities, criteria };
  }
}
