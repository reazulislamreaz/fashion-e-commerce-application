import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { ConflictError, NotFoundError } from '@/common/errors/app.errors';
import {
  buildPaginationMeta,
  PaginatedResult,
  parseActiveStatus,
} from '@/common/utils/pagination.util';
import {
  throwConflictIfReferenced,
  throwConflictIfUnique,
} from '@/common/utils/prisma-errors.util';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { StyleQueryDto } from './dto/style-query.dto';

const STYLE_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;
type StyleSortField = (typeof STYLE_SORT_FIELDS)[number];

@Injectable()
export class StylesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStyleDto) {
    await this.ensureNameAvailable(dto.name);

    try {
      return await this.prisma.style.create({
        data: {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      throwConflictIfUnique(error, 'A style with this name already exists.');
    }
  }

  async findAll(
    query: StyleQueryDto,
  ): Promise<PaginatedResult<Prisma.StyleGetPayload<object>>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.style.count({ where }),
      this.prisma.style.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const style = await this.prisma.style.findUnique({ where: { id } });
    if (!style) {
      throw new NotFoundError('Style not found.');
    }
    return style;
  }

  async update(id: string, dto: UpdateStyleDto) {
    await this.findOne(id);

    if (dto.name) {
      await this.ensureNameAvailable(dto.name, id);
    }

    try {
      return await this.prisma.style.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (error) {
      throwConflictIfUnique(error, 'A style with this name already exists.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.style.delete({ where: { id } });
      return { id };
    } catch (error) {
      throwConflictIfReferenced(
        error,
        'Style cannot be deleted because it is referenced by products. Deactivate it instead.',
      );
    }
  }

  private buildWhere(query: StyleQueryDto): Prisma.StyleWhereInput {
    const isActive = parseActiveStatus(query.status);
    return {
      ...(isActive === undefined ? {} : { isActive }),
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };
  }

  private buildOrderBy(
    query: StyleQueryDto,
  ): Prisma.StyleOrderByWithRelationInput {
    const requested = query.sortBy ?? 'name';
    const field: StyleSortField = STYLE_SORT_FIELDS.includes(
      requested as StyleSortField,
    )
      ? (requested as StyleSortField)
      : 'name';
    return { [field]: query.sortOrder ?? 'asc' };
  }

  private async ensureNameAvailable(name: string, excludeId?: string) {
    const existing = await this.prisma.style.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictError('A style with this name already exists.');
    }
  }
}
