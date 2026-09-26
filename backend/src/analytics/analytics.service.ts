import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { getParticipationTier } from '../common/participation-tier';

// ponytail: fixed list instead of a real Criteria-group table (that model doesn't exist yet)
const CRITERIA_CATEGORIES = ['Tình nguyện', 'Học thuật', 'Văn hóa - Thể thao', 'Kỹ năng & Ngoại khóa'];

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

  async dashboard() {
    const [students, activities, participations, attended, pending, needsMoreInfo] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.activity.count(),
      this.prisma.participation.count(),
      this.prisma.participation.count({ where: { status: 'ATTENDED' } }),
      this.prisma.declaration.count({ where: { status: { in: ['SUBMITTED', 'PROCESSING'] } } }),
      this.prisma.declaration.count({ where: { status: 'NEEDS_MORE_INFO' } }),
    ]);
    const flagged = await this.flaggedStudents();
    const byCategory = await this.prisma.activity.groupBy({ by: ['category'], _count: { _all: true } });

    return {
      students,
      activities,
      participations,
      participationRate: participations > 0 ? Math.round((attended / participations) * 100) : 0,
      pendingVerification: pending,
      needsMoreInfo,
      attentionCount: flagged.length,
      byCategory: byCategory.map(x => ({ category: x.category, value: x._count._all })),
    };
  }

  private async flaggedStudents() {
    const students = await this.prisma.student.findMany({
      include: { user: true, participations: { include: { activity: true } } },
    });
    return students
      .map((s) => {
        const count = s.participations.length;
        const tier = getParticipationTier(count);
        const coveredCategories = new Set(s.participations.map((p) => p.activity.category));
        const missingCategories = CRITERIA_CATEGORIES.filter((c) => !coveredCategories.has(c));
        return { student: s, count, tier, missingCategories };
      })
      .filter((s) => s.tier !== 'Cao');
  }

  async attentionStudents() {
    const flagged = await this.flaggedStudents();
    return flagged.map(({ student, count, tier, missingCategories }) => ({
      id: student.id,
      mssv: student.mssv,
      name: student.user.name,
      className: student.className,
      cohort: student.cohort,
      activities: count,
      missingCriteria: missingCategories.length,
      warning: tier === 'Thấp' ? 'Cao' : 'Trung bình',
      suggestion: missingCategories.length
        ? `Cần bổ sung hoạt động thuộc nhóm "${missingCategories[0]}"`
        : 'Đã tham gia đủ các nhóm hoạt động, cần tăng số lượng',
    }));
  }

  async recommendations() {
    const flagged = await this.flaggedStudents();
    const now = new Date();
    const results: { student: string; mssv: string; missing: string; activityId: number | null; activityTitle: string | null; category: string | null; startAt: Date | null }[] = [];

    for (const { student, missingCategories } of flagged) {
      if (!missingCategories.length) continue;
      const joinedActivityIds = student.participations.map((p) => p.activityId);
      const suggestion = await this.prisma.activity.findFirst({
        where: {
          category: missingCategories[0],
          published: true,
          startAt: { gte: now },
          id: { notIn: joinedActivityIds.length ? joinedActivityIds : undefined },
        },
        orderBy: { startAt: 'asc' },
      });
      results.push({
        student: student.user.name,
        mssv: student.mssv,
        missing: missingCategories[0],
        activityId: suggestion?.id ?? null,
        activityTitle: suggestion?.title ?? null,
        category: suggestion?.category ?? null,
        startAt: suggestion?.startAt ?? null,
      });
    }
    return results;
  }
}
