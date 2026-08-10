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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Products')
@ApiBearerAuth('bearer-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Create a product' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return {
      success: true,
      message: 'Product created successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List products with pagination, search, multi-filtering, and sorting',
  })
  async findAll(@Query() query: ProductQueryDto) {
    const result = await this.productsService.findAll(query);
    return {
      success: true,
      message: 'Products retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  async findOne(@Param() params: IdParamDto) {
    const data = await this.productsService.findOne(params.id);
    return {
      success: true,
      message: 'Product retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Update a product' })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(params.id, dto);
    return {
      success: true,
      message: 'Product updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param() params: IdParamDto) {
    const data = await this.productsService.remove(params.id);
    return {
      success: true,
      message: 'Product deleted successfully',
      data,
    };
  }
}
