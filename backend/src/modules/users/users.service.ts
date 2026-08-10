import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { RoleCode, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = { code: role };
    }

    if (status) {
      where.status = status;
    }

    const [totalItems, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: users,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(
        `User with email '${dto.email}' already exists`,
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { code: dto.roleCode },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with code '${dto.roleCode}' not found`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        roleId: role.id,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email.toLowerCase(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `User with email '${dto.email}' already exists`,
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async updateStatus(id: string, status: UserStatus) {
    await this.findOne(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async updateRole(id: string, roleCode: RoleCode) {
    await this.findOne(id);

    const role = await this.prisma.role.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      throw new NotFoundException(`Role with code '${roleCode}' not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { roleId: role.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async getRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
