import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertConfig, DEFAULT_ALERT_CONFIG } from '../common/participation-tier';
import { AlertConfigDto } from './alerts.dto';

const KEY = 'alerts';
const REMIND_KEY = 'reminders';
export type ReminderSettings = { auto: boolean; email: boolean };
const REMIND_DEFAULT: ReminderSettings = { auto: false, email: false };

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<AlertConfig> {
    const row = await this.prisma.setting.findUnique({ where: { key: KEY } });
    return { ...DEFAULT_ALERT_CONFIG, ...((row?.value as Partial<AlertConfig>) ?? {}) };
  }

  // Nhắc nhở tự động: auto = hằng ngày nhắc sinh viên thiếu tiêu chí/có nguy cơ; email = nhắc kèm email.
  async getReminders(): Promise<ReminderSettings> {
    const row = await this.prisma.setting.findUnique({ where: { key: REMIND_KEY } });
    return { ...REMIND_DEFAULT, ...((row?.value as Partial<ReminderSettings>) ?? {}) };
  }

  async setReminders(v: ReminderSettings) {
    const value = { auto: !!v.auto, email: !!v.email };
    await this.prisma.setting.upsert({ where: { key: REMIND_KEY }, update: { value }, create: { key: REMIND_KEY, value } });
    return value;
  }

  async set(dto: AlertConfigDto) {
    if (dto.lowBelow > dto.mediumBelow) throw new BadRequestException('Ngưỡng "Thấp" phải nhỏ hơn hoặc bằng ngưỡng "Trung bình".');
    const value: AlertConfig = { lowBelow: dto.lowBelow, mediumBelow: dto.mediumBelow, targetPoints: dto.targetPoints, manyPending: dto.manyPending, riskAfterPct: dto.riskAfterPct };
    await this.prisma.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
    return value;
  }
}
