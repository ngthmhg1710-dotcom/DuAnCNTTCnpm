import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { SessionAuthGuard } from './session-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { GoogleAuthDto, LoginDto } from './dto/login.dto';
import { OAuthExceptionFilter } from './oauth-exception.filter';

@Controller('auth')
@UseFilters(OAuthExceptionFilter)
export class AuthController {
  constructor(private readonly auth: AuthService) {}


  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any) {
    const user = await this.auth.loginWithCredentials(body.username, body.password);
    req.session.user = user;
    req.session.loggedInAt = new Date().toISOString();
    const target = user.role === 'ADMIN'
      ? '/admin/dashboard'
      : user.role === 'STAFF'
        ? '/staff/dashboard'
        : '/student/dashboard';
    return { user, redirectUrl: target };
  }

  @Post('oauth/google-direct')
  async googleDirect(@Body() body: GoogleAuthDto, @Req() req: any) {
    const user = await this.auth.loginWithGoogle(body.email, body.name);
    req.session.user = user;
    req.session.loggedInAt = new Date().toISOString();
    const target = user.role === 'ADMIN'
      ? '/admin/dashboard'
      : user.role === 'STAFF'
        ? '/staff/dashboard'
        : '/student/dashboard';
    return { user, redirectUrl: target };
  }

  @Post('oauth/google-token')
  async googleToken(@Body('idToken') idToken: string, @Req() req: any) {
    const user = await this.auth.verifyGoogleIdToken(idToken);
    req.session.user = user;
    req.session.loggedInAt = new Date().toISOString();
    const target = user.role === 'ADMIN'
      ? '/admin/dashboard'
      : user.role === 'STAFF'
        ? '/staff/dashboard'
        : '/student/dashboard';
    return { user, redirectUrl: target };
  }


  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Passport automatically redirects to Google OAuth 2.0 authorization server.
  }


  @Get('oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    req.session.user = req.user;
    req.session.loggedInAt = new Date().toISOString();
    const frontend = process.env.FRONTEND_URL || 'https://student-activity-web.vercel.app';
    const target = req.user.role === 'ADMIN'
      ? '/admin/dashboard'
      : req.user.role === 'STAFF'
        ? '/staff/dashboard'
        : '/student/dashboard';
    // Encode user data in URL so frontend can save to localStorage
    // without relying on cross-domain session cookies
    const userData = encodeURIComponent(JSON.stringify(req.user));
    return res.redirect(`${frontend}${target}?oauth_user=${userData}`);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: any) {
    return req.session?.user || req.user;
  }

  @Get('users')
  getUsers() {
    return this.auth.getAllUsers();
  }


  @Post('users')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  createUser(@Req() req: any, @Body() b: any) {
    return this.auth.createUser(req.session?.user || req.user, b);
  }

  @Patch('users/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  updateUser(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() b: any) {
    return this.auth.updateUser(req.session?.user || req.user, id, b);
  }

  @Delete('users/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  deleteUser(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.auth.deleteUser(req.session?.user || req.user, id);
  }

  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.session = null;
    return res.json({ success: true, message: 'Đã đăng xuất thành công.' });
  }
}

