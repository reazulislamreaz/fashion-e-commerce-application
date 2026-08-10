import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserQueryDto } from './dto/user-query.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'List users with pagination, search, role, and status filter' })
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.usersService.findAll(query);
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get('roles')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Get available roles list' })
  async getRoles() {
    const roles = await this.usersService.getRoles();
    return {
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  @Get(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Get user details by ID' })
  async findOne(@Param() params: IdParamDto) {
    const user = await this.usersService.findOne(params.id);
    return {
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    };
  }

  @Post()
  @Roles(RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new dashboard user (Super Admin only)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user information (Super Admin only)' })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(params.id, dto);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Patch(':id/status')
  @Roles(RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate/Deactivate user status (Super Admin only)' })
  async updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const user = await this.usersService.updateStatus(params.id, dto.status);
    return {
      success: true,
      message: `User status updated to ${dto.status}`,
      data: user,
    };
  }

  @Patch(':id/role')
  @Roles(RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role assignment (Super Admin only)' })
  async updateRole(
    @Param() params: IdParamDto,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.usersService.updateRole(params.id, dto.roleCode);
    return {
      success: true,
      message: `User role updated to ${dto.roleCode}`,
      data: user,
    };
  }
}
