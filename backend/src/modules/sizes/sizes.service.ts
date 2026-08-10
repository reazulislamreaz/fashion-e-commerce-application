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
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizeQueryDto } from './dto/size-query.dto';

const SIZE_SORT_FIELDS = ['name', 'createdAt', 'updatedAt', 'sortOrder'] as const;
type SizeSortField = (typeof SIZE_SORT_FIELDS)[number];

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSizeDto) {
    await this.ensureNameAvailable(dto.name);

    try {
      return await this.prisma.size.create({
        data: {
          name: dto.name,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      throwConflictIfUnique(error, 'A size with this name already exists.');
    }
  }

  async findAll(
    query: SizeQueryDto,
  ): Promise<PaginatedResult<Prisma.SizeGetPayload<object>>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.size.count({ where }),
      this.prisma.size.findMany({
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
    const size = await this.prisma.size.findUnique({ where: { id } });
    if (!size) {
      throw new NotFoundError('Size not found.');
    }
    return size;
  }

  async update(id: string, dto: UpdateSizeDto) {
    await this.findOne(id);

    if (dto.name) {
      await this.ensureNameAvailable(dto.name, id);
    }

    try {
      return await this.prisma.size.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (error) {
      throwConflictIfUnique(error, 'A size with this name already exists.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.size.delete({ where: { id } });
      return { id };
    } catch (error) {
      throwConflictIfReferenced(
        error,
        'Size cannot be deleted because it is referenced by products. Deactivate it instead.',
      );
    }
  }

  private buildWhere(query: SizeQueryDto): Prisma.SizeWhereInput {
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
    query: SizeQueryDto,
  ): Prisma.SizeOrderByWithRelationInput {
    const requested = query.sortBy ?? 'sortOrder';
    const field: SizeSortField = SIZE_SORT_FIELDS.includes(
      requested as SizeSortField,
    )
      ? (requested as SizeSortField)
      : 'sortOrder';
    return { [field]: query.sortOrder ?? 'asc' };
  }

  private async ensureNameAvailable(name: string, excludeId?: string) {
    const existing = await this.prisma.size.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictError('A size with this name already exists.');
    }
  }
}
