import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { AuthenticationError } from '@/common/errors/app.errors';
import { JwtAccessPayload } from '../types/auth.types';
import { toAuthUser } from '../mappers/user.mapper';
import { AuthUser } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthUser> {
    if (!payload?.sub) {
      throw new AuthenticationError('Invalid access token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user) {
      throw new AuthenticationError('Invalid access token.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthenticationError('Account is inactive.');
    }

    return toAuthUser(user);
  }
}
