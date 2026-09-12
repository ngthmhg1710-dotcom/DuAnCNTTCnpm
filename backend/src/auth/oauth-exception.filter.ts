import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    const envFrontend = process.env.FRONTEND_URL;
    const frontend = (envFrontend && !envFrontend.includes('localhost'))
      ? envFrontend
      : 'https://student-activity-web.vercel.app';

    // Intercept OAuth callback requests
    if (request.url && request.url.includes('/auth/oauth/')) {
      let errorMessage = 'Đăng nhập Google không thành công.';

      if (exception instanceof HttpException) {
        const res: any = exception.getResponse();
        errorMessage = typeof res === 'string' ? res : (Array.isArray(res?.message) ? res.message.join(', ') : res?.message) || errorMessage;
      } else if (exception?.message) {
        errorMessage = exception.message;
      }

      return response.redirect(`${frontend}/login?error=${encodeURIComponent(errorMessage)}`);
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const resBody = exception instanceof HttpException ? exception.getResponse() : { statusCode: status, message: 'Internal server error' };
    
    response.status(status).json(typeof resBody === 'object' ? resBody : { statusCode: status, message: resBody });
  }
}
