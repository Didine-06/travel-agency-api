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
import { DashboardStatsDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
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
}
