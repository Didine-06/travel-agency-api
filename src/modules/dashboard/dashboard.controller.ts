import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto, ClientDashboardStatsDto, ClientDashboardChartsDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get dashboard statistics for admin/agent' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: DashboardStatsDto,
  })
  async getStats(@Res() res: Response) {
    const result = await this.dashboardService.getStats();

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }

  @Get('client/stats')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get dashboard statistics for client' })
  @ApiResponse({
    status: 200,
    description: 'Client dashboard statistics',
    type: ClientDashboardStatsDto,
  })
  async getClientStats(
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const result = await this.dashboardService.getClientStats(user.userId);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }

  @Get('client/charts')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get dashboard charts data for client' })
  @ApiResponse({
    status: 200,
    description: 'Client dashboard charts data',
    type: ClientDashboardChartsDto,
  })
  async getClientCharts(
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const result = await this.dashboardService.getClientCharts(user.userId);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }
}
