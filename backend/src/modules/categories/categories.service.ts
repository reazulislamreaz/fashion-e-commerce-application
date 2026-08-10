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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

const CATEGORY_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;
type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    await this.ensureNameAvailable(dto.name);

    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      throwConflictIfUnique(error, 'A category with this name already exists.');
    }
  }

  async findAll(
    query: CategoryQueryDto,
  ): Promise<PaginatedResult<Prisma.CategoryGetPayload<object>>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
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
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError('Category not found.');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      await this.ensureNameAvailable(dto.name, id);
    }

    try {
      return await this.prisma.category.update({
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
      throwConflictIfUnique(error, 'A category with this name already exists.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.category.delete({ where: { id } });
      return { id };
    } catch (error) {
      throwConflictIfReferenced(
        error,
        'Category cannot be deleted because it is referenced by products. Deactivate it instead.',
      );
    }
  }

  private buildWhere(query: CategoryQueryDto): Prisma.CategoryWhereInput {
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
    query: CategoryQueryDto,
  ): Prisma.CategoryOrderByWithRelationInput {
    const requested = query.sortBy ?? 'name';
    const field: CategorySortField = CATEGORY_SORT_FIELDS.includes(
      requested as CategorySortField,
    )
      ? (requested as CategorySortField)
      : 'name';
    return { [field]: query.sortOrder ?? 'asc' };
  }

  private async ensureNameAvailable(name: string, excludeId?: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictError('A category with this name already exists.');
    }
  }
}
