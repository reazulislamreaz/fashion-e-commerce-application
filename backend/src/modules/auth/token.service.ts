import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { RoleCode } from '@prisma/client';
import {
  AuthTokens,
  JwtAccessPayload,
  JwtRefreshPayload,
} from './types/auth.types';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: JwtSignOptions['expiresIn'];
  private readonly refreshExpiresIn: JwtSignOptions['expiresIn'];
  private readonly refreshExpiresInRaw: string;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessExpiresIn = (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      '15m') as JwtSignOptions['expiresIn'];
    this.refreshExpiresInRaw =
      configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    this.refreshExpiresIn = this
      .refreshExpiresInRaw as JwtSignOptions['expiresIn'];
  }

  async generateTokens(userId: string, roleCode: RoleCode): Promise<{
    tokens: AuthTokens;
    refreshTokenId: string;
    refreshExpiresAt: Date;
  }> {
    const refreshTokenId = randomUUID();
    const accessPayload: JwtAccessPayload = { sub: userId, roleCode };
    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      jti: refreshTokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return {
      tokens: { accessToken, refreshToken },
      refreshTokenId,
      refreshExpiresAt: this.resolveExpirationDate(this.refreshExpiresInRaw),
    };
  }

  async verifyAccessToken(token: string): Promise<JwtAccessPayload> {
    return this.jwtService.verifyAsync<JwtAccessPayload>(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    return this.jwtService.verifyAsync<JwtRefreshPayload>(token, {
      secret: this.refreshSecret,
    });
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveExpirationDate(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
    if (!match) {
      // Fallback to 7 days if misconfigured; Joi/env should prevent this in practice.
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * multipliers[unit]);
  }
}
