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
import { StylesService } from './styles.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { StyleQueryDto } from './dto/style-query.dto';

@ApiTags('Styles')
@ApiBearerAuth('bearer-auth')
@Controller('styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Create a style' })
  async create(@Body() dto: CreateStyleDto) {
    const data = await this.stylesService.create(dto);
    return {
      success: true,
      message: 'Style created successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List styles with pagination and search' })
  async findAll(@Query() query: StyleQueryDto) {
    const result = await this.stylesService.findAll(query);
    return {
      success: true,
      message: 'Styles retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a style by ID' })
  async findOne(@Param() params: IdParamDto) {
    const data = await this.stylesService.findOne(params.id);
    return {
      success: true,
      message: 'Style retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Update a style' })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateStyleDto) {
    const data = await this.stylesService.update(params.id, dto);
    return {
      success: true,
      message: 'Style updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a style' })
  async remove(@Param() params: IdParamDto) {
    const data = await this.stylesService.remove(params.id);
    return {
      success: true,
      message: 'Style deleted successfully',
      data,
    };
  }
}
