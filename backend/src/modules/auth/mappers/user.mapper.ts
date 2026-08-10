import { Role, User } from '@prisma/client';
import { AuthUser } from '../types/auth.types';

type UserWithRole = User & { role: Role };

export function toAuthUser(user: UserWithRole): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: {
      id: user.role.id,
      code: user.role.code,
      name: user.role.name,
    },
    createdAt: user.createdAt,
  };
}
