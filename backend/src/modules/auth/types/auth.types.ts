import { RoleCode, UserStatus } from '@prisma/client';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  role: {
    id: string;
    code: RoleCode;
    name: string;
  };
  createdAt: Date;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type JwtAccessPayload = {
  sub: string;
  roleCode: RoleCode;
};

export type JwtRefreshPayload = {
  sub: string;
  jti: string;
};
