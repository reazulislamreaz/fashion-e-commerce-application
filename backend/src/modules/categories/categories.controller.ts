import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

@ApiTags('Categories')
@ApiBearerAuth('bearer-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Create a category' })
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List categories with pagination and search' })
  async findAll(@Query() query: CategoryQueryDto) {
    const result = await this.categoriesService.findAll(query);
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  async findOne(@Param() params: IdParamDto) {
    const data = await this.categoriesService.findOne(params.id);
    return {
      success: true,
      message: 'Category retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Update a category' })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(params.id, dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param() params: IdParamDto) {
    const data = await this.categoriesService.remove(params.id);
    return {
      success: true,
      message: 'Category deleted successfully',
      data,
    };
  }
}
