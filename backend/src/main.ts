import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { describeDocument } from './swagger';
import { jwtSecret } from './auth/tokens';

async function bootstrap() {
  jwtSecret(); // production thiếu khóa ký token thì dừng ngay, không chạy với khóa mặc định
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.warn('[CẢNH BÁO] Chưa đặt JWT_SECRET: đang dùng tạm OAUTH_SESSION_SECRET để ký token. Hãy đặt JWT_SECRET riêng.');
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // evidence images are sent as base64 inside the JSON body
  app.useBodyParser('json', { limit: '12mb' });
  const frontendUrl = process.env.FRONTEND_URL || 'https://student-activity-web.vercel.app';
  const allowedOrigins = [
    frontendUrl,
    'https://student-activity-web.vercel.app',
    // localhost origins for local development
    'http://localhost:8443',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  });
  // Render terminates TLS at a proxy; needed for secure cookies
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.setGlobalPrefix('api', { exclude: ['/', 'health', 'docs'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Student Activity Management API')
    .setDescription(
      [
        'REST API quản lý hoạt động sinh viên (OAuth 2.0 / OpenID Connect, phân quyền theo vai trò).',
        '',
        '**Cách thử ("Try it out"):**',
        '1. Các endpoint cần đăng nhập: mở `POST /api/auth/login`, bấm Try it out → Execute. Cookie phiên được lưu, các endpoint khác dùng luôn (tài khoản mẫu có trong README).',
        '2. Các endpoint `Mock partner`: bấm **Authorize**, nhập API key (mặc định `mock-partner-key`). Thiếu hoặc sai key trả 401.',
        '',
        'Ký hiệu trong mô tả: SV = sinh viên, CB = cán bộ, AD = admin.',
      ].join('\n'),
    )
    .setVersion('2.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();
  SwaggerModule.setup('docs', app, describeDocument(SwaggerModule.createDocument(app, config)), {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
