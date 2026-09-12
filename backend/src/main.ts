import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieSession from 'cookie-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultFrontend = process.env.FRONTEND_URL || 'https://student-activity-web.vercel.app';
  app.enableCors({
    origin: [
      defaultFrontend,
      'https://student-activity-web.vercel.app',
      'http://localhost:8443',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.use(cookieSession({

    name: 'student_activity_session',
    keys: [process.env.OAUTH_SESSION_SECRET || 'change-me-oauth-session-secret'],
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Student Activity Management API')
    .setDescription('REST API with OAuth 2.0 / OpenID Connect authentication and RBAC')
    .setVersion('2.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
