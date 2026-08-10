import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
  RoleCode,
  UserStatus,
} from '@prisma/client';

const BCRYPT_ROUNDS = 12;

type DbClient = Prisma.TransactionClient | PrismaClient;

type RoleSeed = {
  code: RoleCode;
  name: string;
  description: string;
};

const ROLES: RoleSeed[] = [
  {
    code: RoleCode.SUPER_ADMIN,
    name: 'Super Admin',
    description: 'Full system access including role assignment',
  },
  {
    code: RoleCode.ADMIN,
    name: 'Admin',
    description: 'Dashboard administrator with catalog and order management',
  },
  {
    code: RoleCode.MANAGER,
    name: 'Manager',
    description: 'Operational dashboard access for catalog and orders',
  },
  {
    code: RoleCode.CUSTOMER,
    name: 'Customer',
    description: 'Storefront customer role (default for registration)',
  },
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required seed environment variable: ${name}. Set it in backend/.env (see .env.example).`,
    );
  }
  return value;
}

function createPrismaClient(): { prisma: PrismaClient; pool: Pool } {
  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
}

async function seedRoles(db: DbClient): Promise<Map<RoleCode, string>> {
  const roleIds = new Map<RoleCode, string>();

  for (const role of ROLES) {
    const record = await db.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
      },
    });
    roleIds.set(role.code, record.id);
  }

  return roleIds;
}

async function seedSuperAdmin(
  db: DbClient,
  roleIds: Map<RoleCode, string>,
): Promise<void> {
  const email = requireEnv('SUPER_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SUPER_ADMIN_PASSWORD');
  const fullName =
    process.env.SUPER_ADMIN_FULL_NAME?.trim() || 'System Super Admin';

  if (password.length < 8) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at least 8 characters.');
  }

  const superAdminRoleId = roleIds.get(RoleCode.SUPER_ADMIN);
  if (!superAdminRoleId) {
    throw new Error('Super Admin role was not seeded.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await db.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      roleId: superAdminRoleId,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName,
      email,
      passwordHash,
      roleId: superAdminRoleId,
      status: UserStatus.ACTIVE,
    },
  });
}

async function main() {
  const { prisma, pool } = createPrismaClient();

  try {
    await prisma.$transaction(async (tx) => {
      const roleIds = await seedRoles(tx);
      await seedSuperAdmin(tx, roleIds);
    });

    // eslint-disable-next-line no-console
    console.log('Seed completed: roles and Super Admin are ready.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
   
  console.error('Seed failed:', error);
  process.exit(1);
});
