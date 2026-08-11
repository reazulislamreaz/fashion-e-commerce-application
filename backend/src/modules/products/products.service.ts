import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundError, ValidationError } from '@/common/errors/app.errors';
import {
  buildPaginationMeta,
  PaginatedResult,
  parseActiveStatus,
} from '@/common/utils/pagination.util';
import { throwConflictIfReferenced } from '@/common/utils/prisma-errors.util';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

const PRODUCT_SORT_FIELDS = ['name', 'price', 'createdAt', 'updatedAt'] as const;
type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export const PRODUCT_INCLUDE: Prisma.ProductInclude = {
  category: {
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  },
  style: {
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  },
  productSizes: {
    include: {
      size: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
          isActive: true,
        },
      },
    },
  },
  images: {
    orderBy: [
      { isPrimary: 'desc' },
      { sortOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  },
};

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_INCLUDE;
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductWithRelations> {
    await this.validateCategory(dto.categoryId);
    await this.validateStyle(dto.styleId);
    await this.validateSizes(dto.sizeIds);

    const normalizedImages = this.normalizeImages(dto.images);

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          categoryId: dto.categoryId,
          styleId: dto.styleId,
          isActive: dto.isActive ?? true,
        },
      });

      await tx.productSize.createMany({
        data: dto.sizeIds.map((sizeId) => ({
          productId: product.id,
          sizeId,
        })),
      });

      await tx.productImage.createMany({
        data: normalizedImages.map((img) => ({
          productId: product.id,
          url: img.url,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
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

  async findOne(id: string): Promise<ProductWithRelations> {
    const cleanId = id?.trim();
    const product = await this.prisma.product.findUnique({
      where: { id: cleanId },
      include: PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductWithRelations> {
    await this.findOne(id);

    if (dto.categoryId !== undefined) {
      await this.validateCategory(dto.categoryId);
    }

    if (dto.styleId !== undefined) {
      await this.validateStyle(dto.styleId);
    }

    if (dto.sizeIds !== undefined) {
      await this.validateSizes(dto.sizeIds);
    }

    let normalizedImages:
      | { url: string; sortOrder: number; isPrimary: boolean }[]
      | undefined;
    if (dto.images !== undefined) {
      normalizedImages = this.normalizeImages(dto.images);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
          ...(dto.styleId !== undefined ? { styleId: dto.styleId } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });

      if (dto.sizeIds !== undefined) {
        await tx.productSize.deleteMany({ where: { productId: id } });
        await tx.productSize.createMany({
          data: dto.sizeIds.map((sizeId) => ({
            productId: id,
            sizeId,
          })),
        });
      }

      if (normalizedImages !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: normalizedImages.map((img) => ({
            productId: id,
            url: img.url,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.product.delete({ where: { id } });
      return { id };
    } catch (error) {
      throwConflictIfReferenced(
        error,
        'Product cannot be deleted because it is referenced by orders. Deactivate it instead.',
      );
    }
  }

  private async validateCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new ValidationError('Category not found.');
    }

    if (!category.isActive) {
      throw new ValidationError(
        'Category is inactive and cannot be assigned to products.',
      );
    }
  }

  private async validateStyle(styleId: string) {
    const style = await this.prisma.style.findUnique({
      where: { id: styleId },
    });

    if (!style) {
      throw new ValidationError('Style not found.');
    }

    if (!style.isActive) {
      throw new ValidationError(
        'Style is inactive and cannot be assigned to products.',
      );
    }
  }

  private async validateSizes(sizeIds: string[]) {
    const sizes = await this.prisma.size.findMany({
      where: { id: { in: sizeIds } },
    });

    if (sizes.length !== sizeIds.length) {
      throw new ValidationError('One or more sizes were not found.');
    }

    const inactiveSize = sizes.find((s) => !s.isActive);
    if (inactiveSize) {
      throw new ValidationError(
        `Size '${inactiveSize.name}' is inactive and cannot be assigned to products.`,
      );
    }
  }

  private normalizeImages(images: CreateProductImageDto[]) {
    if (!images || images.length === 0) {
      throw new ValidationError('At least one product image is required.');
    }

    const primaryCount = images.filter((img) => img.isPrimary).length;
    if (primaryCount > 1) {
      throw new ValidationError('A product cannot have multiple primary images.');
    }

    let hasPrimary = primaryCount === 1;

    return images.map((img, index) => {
      let isPrimary = !!img.isPrimary;
      if (!hasPrimary && index === 0) {
        isPrimary = true;
        hasPrimary = true;
      }
      return {
        url: img.url,
        sortOrder: img.sortOrder ?? index,
        isPrimary,
      };
    });
  }

  private buildWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const isActive = parseActiveStatus(query.status);

    return {
      ...(isActive === undefined ? {} : { isActive }),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.styleId ? { styleId: query.styleId } : {}),
      ...(query.sizeId
        ? { productSizes: { some: { sizeId: query.sizeId } } }
        : {}),
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
    query: ProductQueryDto,
  ): Prisma.ProductOrderByWithRelationInput {
    const requested = query.sortBy ?? 'createdAt';
    const field: ProductSortField = PRODUCT_SORT_FIELDS.includes(
      requested as ProductSortField,
    )
      ? (requested as ProductSortField)
      : 'createdAt';
    const defaultOrder = field === 'createdAt' ? 'desc' : 'asc';
    return { [field]: query.sortOrder ?? defaultOrder };
  }
}
