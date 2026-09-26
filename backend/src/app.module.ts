import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ActivitiesModule } from './activities/activities.module';
import { StudentsModule } from './students/students.module';
import { ParticipationsModule } from './participations/participations.module';
import { DeclarationsModule } from './declarations/declarations.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, AnalyticsModule, IntegrationsModule, ActivitiesModule, StudentsModule, ParticipationsModule, DeclarationsModule],
  controllers: [AppController]
})
export class AppModule {}
