import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export type AuditLogParams = {
  userId?: string;
  email?: string;
  eventType: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          email: params.email ? params.email.toLowerCase() : undefined,
          eventType: params.eventType,
          status: params.status,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        },
      });
    } catch (err: unknown) {
      this.logger.error('Failed to create audit log entry', err);
    }
  }
}
