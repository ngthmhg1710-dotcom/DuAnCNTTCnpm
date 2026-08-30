import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, AnalyticsModule, IntegrationsModule],
  controllers: [AppController]
})
export class AppModule {}
