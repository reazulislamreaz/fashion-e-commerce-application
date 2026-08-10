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
import { Public } from '@/common/decorators/public.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizeQueryDto } from './dto/size-query.dto';

@ApiTags('Sizes')
@ApiBearerAuth('bearer-auth')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Create a size' })
  async create(@Body() dto: CreateSizeDto) {
    const data = await this.sizesService.create(dto);
    return {
      success: true,
      message: 'Size created successfully',
      data,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List sizes with pagination and search' })
  async findAll(@Query() query: SizeQueryDto) {
    const result = await this.sizesService.findAll(query);
    return {
      success: true,
      message: 'Sizes retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a size by ID' })
  async findOne(@Param() params: IdParamDto) {
    const data = await this.sizesService.findOne(params.id);
    return {
      success: true,
      message: 'Size retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Update a size' })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateSizeDto) {
    const data = await this.sizesService.update(params.id, dto);
    return {
      success: true,
      message: 'Size updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a size' })
  async remove(@Param() params: IdParamDto) {
    const data = await this.sizesService.remove(params.id);
    return {
      success: true,
      message: 'Size deleted successfully',
      data,
    };
  }
}
