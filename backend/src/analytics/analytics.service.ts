import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [students, activities, participations, declarations] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.activity.count(),
      this.prisma.participation.count(),
      this.prisma.declaration.count()
    ]);

    const byCategory = await this.prisma.activity.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const byDeclarationStatus = await this.prisma.declaration.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    return {
      summary: { students, activities, participations, declarations },
      byCategory: byCategory.map(x => ({ category: x.category, value: x._count._all })),
      byDeclarationStatus: byDeclarationStatus.map(x => ({ status: x.status, value: x._count._all }))
    };
  }
}
