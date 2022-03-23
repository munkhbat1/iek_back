import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminLocalAuthGuard } from 'src/auth/guards/admin-local-auth.guard';
import {
  AuthService,
  FINGERPRINT_COOKIE_MAX_AGE,
  FINGERPRINT_COOKIE_NAME,
} from 'src/auth/auth.service';
import { AdminJwtAuthGuard } from 'src/auth/guards/admin-jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Cookies } from 'src/decorators/cookies.decorator';
import { AdminsService } from './admins.service';
import { AdminJwtRefreshAuthGuard } from 'src/auth/guards/admin-jwt-refresh-auth.guard';

@Controller('admin')
export class AdminsController {
  constructor(
    private authService: AuthService,
    private adminsService: AdminsService,
  ) {}

  @UseGuards(AdminLocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const jwt = await this.authService.loginAdmin(req.user);

    const fingerprint = this.authService.genFingerPrint();
    response.cookie(FINGERPRINT_COOKIE_NAME, fingerprint, {
      path: '/',
      maxAge: FINGERPRINT_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'strict',
      secure: process.env.NODE_ENV === 'development' ? false : true,
    });

    return {
      jwt: { ...jwt },
      fingerprint: this.authService.sha256(fingerprint),
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      email: req.user.adminName,
    };
  }

  @UseGuards(AdminJwtRefreshAuthGuard)
  @Post('auth/refresh-token')
  async refreshToken(
    @Request() req,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Cookies(FINGERPRINT_COOKIE_NAME) fingerprintCookie: string,
  ) {
    if (!fingerprintCookie) throw new UnauthorizedException();

    const { fingerprintHash } = refreshTokenDto;
    const fingerprintCookieHash = this.authService.sha256(fingerprintCookie);
    if (fingerprintHash !== fingerprintCookieHash)
      throw new UnauthorizedException();

    const jwt = await this.authService.loginAdmin(req.user);
    return jwt;
  }
}
