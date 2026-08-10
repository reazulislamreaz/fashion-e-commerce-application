import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Get summary statistics for management dashboard' })
  async getStats() {
    const data = await this.dashboardService.getStats();
    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data,
    };
  }
}
