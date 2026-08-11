import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser } from './types/auth.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private extractReqInfo(req: Request) {
    return {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const data = await this.authService.register(dto, this.extractReqInfo(req));
    return {
      success: true,
      message: 'Registration successful',
      data,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    const result = await this.authService.verifyEmail(dto.token, this.extractReqInfo(req));
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto, @Req() req: Request) {
    const result = await this.authService.resendVerification(dto.email, this.extractReqInfo(req));
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token via email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const result = await this.authService.forgotPassword(dto, this.extractReqInfo(req));
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const result = await this.authService.resetPassword(dto, this.extractReqInfo(req));
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const data = await this.authService.login(dto, this.extractReqInfo(req));
    return {
      success: true,
      message: 'Login successful',
      data,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Social authentication (Google / Facebook)' })
  async socialLogin(@Body() dto: SocialAuthDto, @Req() req: Request) {
    const data = await this.authService.socialLogin(dto, this.extractReqInfo(req));
    return {
      success: true,
      message: 'Social authentication successful',
      data,
    };
  }

  private getCallbackUrl(req: Request, path: string): string {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const apiPrefix = this.configService.get<string>('API_PREFIX', '/api/v1');
    const normalizedPrefix = apiPrefix.replace(/^\//, '').replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');

    if (backendUrl) {
      return `${backendUrl.replace(/\/$/, '')}/${normalizedPrefix}/${cleanPath}`;
    }

    const host = req.get('host') || 'localhost';
    const protoHeader = req.get('x-forwarded-proto');
    const protocol = protoHeader ? protoHeader.split(',')[0].trim() : req.protocol || 'http';
    return `${protocol}://${host}/${normalizedPrefix}/${cleanPath}`;
  }

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login redirect' })
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackUrl = this.getCallbackUrl(req, 'auth/google/callback');

    if (!clientId) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google OAuth CLIENT_ID is not configured')}`);
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&response_type=code&scope=email%20profile`;

    return res.redirect(googleAuthUrl);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');

    if (error || !code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error || 'Google authorization cancelled')}`);
    }

    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      const callbackUrl = this.getCallbackUrl(req, 'auth/google/callback');

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to obtain Google access token');
      }

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleUser = await userRes.json();

      if (!googleUser.email) {
        throw new Error('Google profile did not provide an email address.');
      }

      const data = await this.authService.socialLogin(
        {
          provider: 'google',
          email: googleUser.email,
          fullName: googleUser.name || googleUser.email.split('@')[0],
          providerId: googleUser.id,
        },
        this.extractReqInfo(req),
      );

      return res.redirect(
        `${frontendUrl}/oauth/callback?accessToken=${encodeURIComponent(data.accessToken)}&refreshToken=${encodeURIComponent(data.refreshToken)}`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google OAuth failed';
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }

  @Public()
  @Get('facebook')
  @ApiOperation({ summary: 'Initiate Facebook OAuth login redirect' })
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('FACEBOOK_CLIENT_ID');
    const callbackUrl = this.getCallbackUrl(req, 'auth/facebook/callback');

    if (!clientId) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Facebook OAuth CLIENT_ID is not configured')}`);
    }

    const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&scope=email,public_profile`;

    return res.redirect(fbAuthUrl);
  }

  @Public()
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Handle Facebook OAuth callback' })
  async facebookAuthCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');

    if (error || !code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error || 'Facebook authorization cancelled')}`);
    }

    try {
      const clientId = this.configService.get<string>('FACEBOOK_CLIENT_ID');
      const clientSecret = this.configService.get<string>('FACEBOOK_CLIENT_SECRET');
      const callbackUrl = this.getCallbackUrl(req, 'auth/facebook/callback');

      const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          callbackUrl,
        )}&client_secret=${clientSecret}&code=${code}`,
      );
      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        throw new Error(tokenData.error?.message || 'Failed to obtain Facebook access token');
      }

      const userRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`,
      );
      const fbUser = await userRes.json();

      const userEmail = fbUser.email || `${fbUser.id}@facebook.social`;

      const data = await this.authService.socialLogin(
        {
          provider: 'facebook',
          email: userEmail,
          fullName: fbUser.name || 'Facebook User',
          providerId: fbUser.id,
        },
        this.extractReqInfo(req),
      );

      return res.redirect(
        `${frontendUrl}/oauth/callback?accessToken=${encodeURIComponent(data.accessToken)}&refreshToken=${encodeURIComponent(data.refreshToken)}`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Facebook OAuth failed';
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new tokens' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return {
      success: true,
      message: 'Token refresh successful',
      data,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Revoke the provided refresh token' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    await this.authService.logout(user.id, dto.refreshToken, this.extractReqInfo(req));
    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  @Get('me')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  async me(@CurrentUser() user: AuthUser) {
    const data = await this.authService.getMe(user.id);
    return {
      success: true,
      message: 'Current user profile',
      data,
    };
  }
}
