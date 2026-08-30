import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { SessionAuthGuard } from './session-auth.guard';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, SessionAuthGuard, PrismaService],
  exports: [AuthService, GoogleStrategy, SessionAuthGuard]
})
export class AuthModule {}
