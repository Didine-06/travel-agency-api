import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  HttpStatus,
  Res,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AgentAvailabilitiesService } from './agent-availabilities.service';
import {
  CreateAgentAvailabilityDto,
  AgentAvailabilityResponseDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ConsultationErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Agent Availabilities')
@ApiBearerAuth('JWT-auth')
@Controller('agent-availabilities')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class AgentAvailabilitiesController {
  constructor(
    private readonly agentAvailabilitiesService: AgentAvailabilitiesService,
    private readonly i18n: I18nService,
  ) {}

  // ===== Agent Endpoints =====

  @Post('my-availabilities')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create my availability (Agent)' })
  @ApiResponse({
    status: 201,
    description: 'Availability created',
    type: AgentAvailabilityResponseDto,
  })
  public async createMyAvailability(
    @CurrentUser() user: any,
    @Body() createAgentAvailabilityDto: CreateAgentAvailabilityDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.agentAvailabilitiesService.createMyAvailability(
      user.userId,
      createAgentAvailabilityDto,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as ConsultationErrors) {
        case ConsultationErrors.AGENT_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.INVALID_CONSULTATION_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('my-availabilities')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get my availabilities (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'List of my availabilities',
  })
  public async findMyAvailabilities(@CurrentUser() user: any) {
    return this.agentAvailabilitiesService.findMyAvailabilities(user.userId);
  }

  @Delete('my-availabilities/:id')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete my availability (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted',
  })
  public async deleteMyAvailability(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.agentAvailabilitiesService.deleteMyAvailability(
      user.userId,
      id,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as ConsultationErrors) {
        case ConsultationErrors.AGENT_NOT_FOUND:
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  // ===== Admin Endpoints =====

  @Get('agent/:agentId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get availabilities by agent ID (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of agent availabilities',
  })
  public async findAvailabilitiesByAgentId(
    @Param('agentId') agentId: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result =
      await this.agentAvailabilitiesService.findAvailabilitiesByAgentId(
        agentId,
      );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as ConsultationErrors) {
        case ConsultationErrors.AGENT_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('available-agents')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get available agents for a time slot' })
  @ApiQuery({ name: 'dayOfWeek', example: 1, description: '0=dimanche, 1=lundi' })
  @ApiQuery({ name: 'time', example: '10:00', description: 'Format HH:mm' })
  @ApiResponse({
    status: 200,
    description: 'List of available agents',
  })
  public async findAvailableAgentsForSlot(
    @Query('dayOfWeek') dayOfWeek: string,
    @Query('time') time: string,
  ) {
    return this.agentAvailabilitiesService.findAvailableAgentsForSlot(
      parseInt(dayOfWeek),
      time,
    );
  }
}
