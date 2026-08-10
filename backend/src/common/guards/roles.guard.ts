import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleCode } from '@prisma/client';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { AuthorizationError } from '@/common/errors/app.errors';
import { AuthUser } from '@/modules/auth/types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new AuthorizationError();
    }

    if (!requiredRoles.includes(user.role.code)) {
      throw new AuthorizationError();
    }

    return true;
  }
}
