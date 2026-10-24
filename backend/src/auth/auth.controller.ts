import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { SessionAuthGuard } from './session-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { GoogleAuthDto, LoginDto } from './dto/login.dto';
import { OAuthExceptionFilter } from './oauth-exception.filter';
import { ACCESS, REFRESH, clearTokens, issueAccess, issueTokens, readToken } from './tokens';

class GoogleGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { session: false };
  }
}

const homeOf = (role: string) => (role === 'ADMIN' ? '/admin/dashboard' : role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard');

@Controller('auth')
@UseFilters(OAuthExceptionFilter)
export class AuthController {
  constructor(private readonly auth: AuthService) {}


  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.loginWithCredentials(body.username, body.password);
    await this.start(res, user);
    return { user, redirectUrl: homeOf(user.role) };
  }

  @Post('oauth/google-direct')
  async googleDirect(@Body() body: GoogleAuthDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.loginWithGoogle(body.email, body.name);
    await this.start(res, user);
    return { user, redirectUrl: homeOf(user.role) };
  }

  @Post('oauth/google-token')
  async googleToken(@Body('idToken') idToken: string, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.verifyGoogleIdToken(idToken);
    await this.start(res, user);
    return { user, redirectUrl: homeOf(user.role) };
  }


  @Get('oauth/google')
  @UseGuards(GoogleGuard)
  async googleLogin() {
    // Passport automatically redirects to Google OAuth 2.0 authorization server.
  }


  @Get('oauth/google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    await this.start(res, req.user);
    const frontend = process.env.FRONTEND_URL || 'https://student-activity-web.vercel.app';
    const target = homeOf(req.user.role);
    return res.redirect(`${frontend}${target}`);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }

  @Get('users')
  getUsers() {
    return this.auth.getAllUsers();
  }


  @Post('users')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  createUser(@Req() req: any, @Body() b: any) {
    return this.auth.createUser(req.user, b);
  }

  @Patch('users/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  updateUser(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() b: any) {
    return this.auth.updateUser(req.user, id, b);
  }

  @Delete('users/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  deleteUser(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.auth.deleteUser(req.user, id);
  }

  // Đổi refresh token (cookie HttpOnly) lấy access token mới.
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const p = readToken(req.cookies?.[REFRESH], 'refresh');
    const user = p && (await this.auth.activeUser(p.sub, p.tv));
    if (!user) {
      clearTokens(res);
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn.');
    }
    issueAccess(res, user, p.tv);
    return { user };
  }

  // Hủy token: tăng tokenVersion nên mọi access/refresh token đã cấp đều vô hiệu.
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const p = readToken(req.cookies?.[REFRESH], 'refresh') || readToken(req.cookies?.[ACCESS], 'access');
    const id = p?.sub ?? p?.user?.id;
    if (id) {
      await this.auth.revokeTokens(id, p.tv);
      req.user = { id }; // để audit log biết ai đăng xuất
    }
    clearTokens(res);
    return { success: true, message: 'Đã đăng xuất thành công.' };
  }

  private async start(res: Response, user: any) {
    issueTokens(res, user, await this.auth.tokenVersion(user.id));
  }
}

