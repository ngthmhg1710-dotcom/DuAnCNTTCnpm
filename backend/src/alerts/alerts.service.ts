import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertConfig, DEFAULT_ALERT_CONFIG } from '../common/participation-tier';
import { AlertConfigDto } from './alerts.dto';

const KEY = 'alerts';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<AlertConfig> {
    const row = await this.prisma.setting.findUnique({ where: { key: KEY } });
    return { ...DEFAULT_ALERT_CONFIG, ...((row?.value as Partial<AlertConfig>) ?? {}) };
  }

  async set(dto: AlertConfigDto) {
    if (dto.lowBelow > dto.mediumBelow) throw new BadRequestException('Ngưỡng "Thấp" phải nhỏ hơn hoặc bằng ngưỡng "Trung bình".');
    const value: AlertConfig = { lowBelow: dto.lowBelow, mediumBelow: dto.mediumBelow, targetPoints: dto.targetPoints, manyPending: dto.manyPending, riskAfterPct: dto.riskAfterPct };
    await this.prisma.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
    return value;
  }
}
