import { Injectable } from '@nestjs/common';
import { Prisma, RoleCode, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '@/database/prisma.service';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/common/errors/app.errors';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { toAuthUser } from './mappers/user.mapper';
import { AuthResult, AuthUser } from './types/auth.types';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(
    dto: RegisterDto,
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<{ message: string }> {
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
          status: UserStatus.PENDING_VERIFICATION,
          isEmailVerified: false,
        },
        include: { role: true },
      });

      const rawToken = this.generateRandomToken();
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName,
        rawToken,
      );

      await this.auditService.log({
        userId: user.id,
        email: user.email,
        eventType: 'REGISTER',
        status: 'SUCCESS',
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent,
      });

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        await this.auditService.log({
          email: dto.email,
          eventType: 'REGISTER',
          status: 'FAILURE',
          ipAddress: reqInfo?.ip,
          userAgent: reqInfo?.userAgent,
          metadata: { reason: 'Email already exists' },
        });
        throw new ConflictError('A user with this email already exists.');
      }
      throw error;
    }
  }

  async verifyEmail(
    token: string,
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<{ message: string }> {
    const tokenHash = this.hashToken(token);

    const verificationRecord = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verificationRecord) {
      throw new ValidationError('Invalid or expired verification token.');
    }

    if (verificationRecord.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
      throw new ValidationError('Verification token has expired. Please request a new link.');
    }

    const user = verificationRecord.user;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });

    await this.prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    });

    await this.mailService.sendAccountActivationEmail(user.email, user.fullName);

    await this.auditService.log({
      userId: user.id,
      email: user.email,
      eventType: 'EMAIL_VERIFIED',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });

    return {
      message: 'Email successfully verified! Your account is now active.',
    };
  }

  async resendVerification(
    email: string,
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && !user.isEmailVerified) {
      // Clean previous tokens
      await this.prisma.verificationToken.deleteMany({
        where: { userId: user.id },
      });

      const rawToken = this.generateRandomToken();
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName,
        rawToken,
      );
    }

    await this.auditService.log({
      email,
      eventType: 'RESEND_VERIFICATION',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });

    return {
      message:
        'If an unverified account exists with this email, a new verification link has been sent.',
    };
  }

  async login(
    dto: LoginDto,
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<AuthResult> {
    const emailLower = dto.email.toLowerCase();

    // Check rate limit / lockout
    const attempt = await this.prisma.loginAttempt.findUnique({
      where: { email: emailLower },
    });

    if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      const waitMins = Math.ceil(
        (attempt.lockedUntil.getTime() - Date.now()) / (60 * 1000),
      );
      await this.auditService.log({
        email: emailLower,
        eventType: 'LOGIN_BLOCKED',
        status: 'BLOCKED',
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent,
        metadata: { lockedUntil: attempt.lockedUntil },
      });
      throw new AuthenticationError(
        `Account login is temporarily locked due to excessive failed attempts. Please try again in ${waitMins} minute(s).`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      await this.recordFailedAttempt(emailLower, reqInfo);
      throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      await this.recordFailedAttempt(emailLower, reqInfo);
      throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.status === UserStatus.PENDING_VERIFICATION || !user.isEmailVerified) {
      await this.auditService.log({
        userId: user.id,
        email: user.email,
        eventType: 'LOGIN_FAILED',
        status: 'FAILURE',
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent,
        metadata: { reason: 'Email not verified' },
      });
      throw new AuthenticationError(
        'Please verify your email address before logging in.',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.auditService.log({
        userId: user.id,
        email: user.email,
        eventType: 'LOGIN_FAILED',
        status: 'FAILURE',
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent,
        metadata: { reason: 'Account inactive or suspended' },
      });
      throw new AuthenticationError('Account is inactive or suspended.');
    }

    // Reset failed attempts on success
    if (attempt) {
      await this.prisma.loginAttempt.delete({
        where: { email: emailLower },
      });
    }

    await this.auditService.log({
      userId: user.id,
      email: user.email,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });

    return this.issueAuthResult(user);
  }

  private async recordFailedAttempt(
    email: string,
    reqInfo?: { ip?: string; userAgent?: string },
  ) {
    const existing = await this.prisma.loginAttempt.findUnique({
      where: { email },
    });

    const newAttempts = (existing?.attempts || 0) + 1;
    let lockedUntil: Date | null = null;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }

    await this.prisma.loginAttempt.upsert({
      where: { email },
      create: {
        email,
        attempts: 1,
        lockedUntil,
      },
      update: {
        attempts: newAttempts,
        lockedUntil,
      },
    });

    await this.auditService.log({
      email,
      eventType: lockedUntil ? 'LOGIN_BLOCKED' : 'LOGIN_FAILED',
      status: lockedUntil ? 'BLOCKED' : 'FAILURE',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
      metadata: { attempts: newAttempts, lockedUntil },
    });
  }

  async forgotPassword(
    dto: { email: string },
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<{ message: string }> {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.status === UserStatus.ACTIVE) {
      // Invalidate existing reset tokens for user
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const rawToken = this.generateRandomToken();
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.mailService.sendForgotPasswordEmail(
        user.email,
        user.fullName,
        rawToken,
      );
    }

    await this.auditService.log({
      email,
      eventType: 'PASSWORD_RESET_REQUEST',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });

    return {
      message:
        'If an active account exists for this email, password reset instructions have been sent.',
    };
  }

  async resetPassword(
    dto: { token: string; password: string },
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<{ message: string }> {
    const tokenHash = this.hashToken(dto.token);

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt) {
      throw new ValidationError('Invalid or already-used password reset token.');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new ValidationError('Password reset token has expired. Please request a new reset link.');
    }

    const newPasswordHash = await this.passwordService.hash(dto.password);

    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newPasswordHash },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Revoke existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log({
      userId: resetRecord.userId,
      email: resetRecord.user.email,
      eventType: 'PASSWORD_RESET_SUCCESS',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });

    return {
      message: 'Password successfully updated. You may now log in with your new password.',
    };
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

    await this.refreshTokenService.revokeById(storedToken.id);

    return this.issueAuthResult(user);
  }

  async logout(
    userId: string,
    refreshToken: string,
    reqInfo?: { ip?: string; userAgent?: string },
  ): Promise<void> {
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

    await this.auditService.log({
      userId,
      eventType: 'LOGOUT',
      status: 'SUCCESS',
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent,
    });
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
