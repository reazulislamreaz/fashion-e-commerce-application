import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('CORS_ORIGIN') ||
      'http://localhost:3001';

    const gmailUser =
      this.configService.get<string>('GMAIL_USER') ||
      this.configService.get<string>('APP_USER_EMAIL');

    const gmailPass =
      this.configService.get<string>('GMAIL_APP_PASSWORD') ||
      this.configService.get<string>('APP_PASSWORD');

    if (gmailUser && gmailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      this.logger.log(`Nodemailer initialized for user: ${gmailUser}`);
    } else {
      this.logger.warn(
        'Nodemailer transporter disabled: GMAIL_USER / GMAIL_APP_PASSWORD not configured.',
      );
    }
  }

  async sendVerificationEmail(email: string, fullName: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; color: #1c1917;">
        <h2 style="color: #1c1917; font-size: 24px; margin-bottom: 16px; text-transform: uppercase;">Easy Fashion Limited</h2>
        <p style="font-size: 14px; color: #44403c;">Hello ${fullName},</p>
        <p style="font-size: 14px; color: #44403c; line-height: 1.5;">
          Thank you for registering with Easy Fashion Limited. Please verify your email address to activate your account.
        </p>
        <div style="margin: 28px 0;">
          <a href="${verificationUrl}" style="background-color: #0c0a09; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; color: #78716c;">
          This link will expire in 24 hours. If you did not create an account, please ignore this email.
        </p>
      </div>
    `;

    await this.sendMail(email, 'Verify your email — Easy Fashion Limited', html);
  }

  async sendForgotPasswordEmail(email: string, fullName: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; color: #1c1917;">
        <h2 style="color: #1c1917; font-size: 24px; margin-bottom: 16px; text-transform: uppercase;">Easy Fashion Limited</h2>
        <p style="font-size: 14px; color: #44403c;">Hello ${fullName},</p>
        <p style="font-size: 14px; color: #44403c; line-height: 1.5;">
          We received a request to reset your password. Click the link below to choose a new password.
        </p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #0c0a09; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #78716c;">
          This password reset link is valid for 15 minutes and can only be used once. If you did not request this, your account is safe.
        </p>
      </div>
    `;

    await this.sendMail(email, 'Reset your password — Easy Fashion Limited', html);
  }

  async sendAccountActivationEmail(email: string, fullName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; color: #1c1917;">
        <h2 style="color: #1c1917; font-size: 24px; margin-bottom: 16px; text-transform: uppercase;">Easy Fashion Limited</h2>
        <p style="font-size: 14px; color: #44403c;">Hello ${fullName},</p>
        <p style="font-size: 14px; color: #44403c; line-height: 1.5;">
          Your email address has been verified and your account is now fully active! You can now log in and explore our fashion collection.
        </p>
        <div style="margin: 28px 0;">
          <a href="${this.frontendUrl}/login" style="background-color: #C9A227; color: #0c0a09; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Log In Now
          </a>
        </div>
      </div>
    `;

    await this.sendMail(email, 'Account Activated — Easy Fashion Limited', html);
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[MOCK MAIL] To: ${to} | Subject: "${subject}" (Transporter not configured)`,
      );
      return;
    }

    try {
      const from =
        this.configService.get<string>('GMAIL_USER') ||
        this.configService.get<string>('APP_USER_EMAIL');

      await this.transporter.sendMail({
        from: `"Easy Fashion Limited" <${from}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email successfully sent to ${to}: ${subject}`);
    } catch (err: unknown) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }
}
