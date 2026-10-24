import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ActivitiesModule } from './activities/activities.module';
import { StudentsModule } from './students/students.module';
import { ParticipationsModule } from './participations/participations.module';
import { DeclarationsModule } from './declarations/declarations.module';
import { RoleDefsModule } from './role-defs/role-defs.module';
import { AuditModule } from './audit/audit.module';
import { SemestersModule } from './semesters/semesters.module';
import { CriteriaModule } from './criteria/criteria.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, AnalyticsModule, IntegrationsModule, ActivitiesModule, StudentsModule, ParticipationsModule, DeclarationsModule, RoleDefsModule, AuditModule, SemestersModule, CriteriaModule, NotificationsModule],
  controllers: [AppController]
})
export class AppModule {}
