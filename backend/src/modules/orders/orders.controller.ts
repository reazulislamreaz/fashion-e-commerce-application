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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';
import { AuthUser } from '@/modules/auth/types/auth.types';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@ApiBearerAuth('bearer-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order (Authenticated Customer)' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.create(user, dto);
    return {
      success: true,
      message: 'Order placed successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List orders (Customer gets own orders; Management gets all with filtering & pagination)',
  })
  async findAll(@CurrentUser() user: AuthUser, @Query() query: OrderQueryDto) {
    const result = await this.ordersService.findAll(user, query);
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: result.items,
      meta: { pagination: result.pagination },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  async findOne(@CurrentUser() user: AuthUser, @Param() params: IdParamDto) {
    const data = await this.ordersService.findOne(params.id, user);
    return {
      success: true,
      message: 'Order retrieved successfully',
      data,
    };
  }

  @Patch(':id/status')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Update order status (Management users only)' })
  async updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(params.id, dto.status);
    return {
      success: true,
      message: 'Order status updated successfully',
      data,
    };
  }
}
