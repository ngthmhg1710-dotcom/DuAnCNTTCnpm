import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export type MailResult = { ok: boolean; error?: string };
export type MailProvider = 'brevo' | 'smtp' | 'dry-run';

// Gửi email. Chọn đường gửi theo biến môi trường (xem backend/.env.example):
//  - BREVO_API_KEY + MAIL_FROM : gửi qua API HTTPS của Brevo. Chạy được trên Render gói miễn phí (gói này chặn cổng SMTP).
//  - SMTP_USER + SMTP_PASS     : gửi qua SMTP, mặc định Gmail (smtp.gmail.com:465) với "mật khẩu ứng dụng" của tài khoản Gmail.
//  - MAIL_DRY_RUN=true         : không gửi thật, chỉ ghi log (dùng khi thử).
@Injectable()
export class MailService {
  private readonly log = new Logger('Mail');
  private transporter?: nodemailer.Transporter;

  provider(): MailProvider | null {
    if (process.env.MAIL_DRY_RUN === 'true') return 'dry-run';
    if (process.env.BREVO_API_KEY && this.from()) return 'brevo';
    if (process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
    return null;
  }

  from() {
    return process.env.MAIL_FROM || process.env.SMTP_USER || '';
  }

  private fromName() {
    return process.env.MAIL_FROM_NAME || 'Khoa CNTT - TDTU';
  }

  async send(to: string, subject: string, text: string): Promise<MailResult> {
    const provider = this.provider();
    if (!provider) return { ok: false, error: 'Chưa cấu hình gửi email.' };
    const body = `${text}\n\n--\nEmail tự động từ hệ thống Quản lý hoạt động sinh viên, vui lòng không trả lời.`;
    try {
      if (provider === 'dry-run') {
        this.log.log(`[DRY-RUN] tới ${to}: ${subject}`);
        return { ok: true };
      }
      if (provider === 'brevo') {
        const r = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': process.env.BREVO_API_KEY as string, 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ sender: { email: this.from(), name: this.fromName() }, to: [{ email: to }], subject, textContent: body }),
        });
        if (!r.ok) return { ok: false, error: `Brevo trả lỗi ${r.status}: ${(await r.text()).slice(0, 160)}` };
        return { ok: true };
      }
      await this.smtp().sendMail({ from: `"${this.fromName()}" <${this.from()}>`, to, subject, text: body });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e).slice(0, 200) };
    }
  }

  private smtp() {
    if (!this.transporter) {
      const port = Number(process.env.SMTP_PORT || 465);
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        connectionTimeout: 15000,
        socketTimeout: 20000,
      });
    }
    return this.transporter;
  }
}
