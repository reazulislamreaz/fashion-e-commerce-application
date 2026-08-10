import { Injectable } from '@nestjs/common';
import { Prisma, RoleCode, UserStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '@/common/errors/app.errors';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { toAuthUser } from './mappers/user.mapper';
import { AuthResult, AuthUser } from './types/auth.types';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const customerRole = await this.prisma.role.findUnique({
      where: { code: RoleCode.CUSTOMER },
    });

    if (!customerRole) {
      throw new NotFoundError(
        'Customer role is not configured. Run database seed first.',
      );
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          roleId: customerRole.id,
          status: UserStatus.ACTIVE,
        },
        include: { role: true },
      });

      return this.issueAuthResult(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictError('A user with this email already exists.');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthenticationError('Account is inactive.');
    }

    const passwordMatches = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.issueAuthResult(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload;
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenService.findActiveByHash(tokenHash);

    if (!storedToken || storedToken.id !== payload.jti) {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    // Rotate: revoke old token before issuing replacements.
    await this.refreshTokenService.revokeById(storedToken.id);

    return this.issueAuthResult(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    if (payload.sub !== userId) {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenService.findActiveByHash(tokenHash);

    if (!storedToken || storedToken.id !== payload.jti) {
      throw new AuthenticationError('Invalid or expired refresh token.');
    }

    await this.refreshTokenService.revokeById(storedToken.id);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new AuthenticationError('Authentication required');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthenticationError('Account is inactive.');
    }

    return toAuthUser(user);
  }

  private async issueAuthResult(
    user: Parameters<typeof toAuthUser>[0],
  ): Promise<AuthResult> {
    const { tokens, refreshTokenId, refreshExpiresAt } =
      await this.tokenService.generateTokens(user.id, user.role.code);

    await this.refreshTokenService.create({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: this.tokenService.hashToken(tokens.refreshToken),
      expiresAt: refreshExpiresAt,
    });

    return {
      user: toAuthUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
