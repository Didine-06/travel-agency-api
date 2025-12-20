import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  HttpStatus,
  Res,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ConsultationsService } from './consultations.service';
import {
  CreateConsultationDto,
  UpdateConsultationDto,
  ConsultationResponseDto,
  ConsultationListResponseDto,
  ConsultationDetailResponseDto,
  CancelConsultationDto,
  DeleteConsultationsDto,
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

@ApiTags('Consultations')
@ApiBearerAuth('JWT-auth')
@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly i18n: I18nService,
  ) {}

  // ===== Client Endpoints =====

  @Post('my-consultations')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a consultation request (Client)' })
  @ApiResponse({
    status: 201,
    description: 'Consultation created',
    type: ConsultationResponseDto,
  })
  public async createMyConsultation(
    @CurrentUser() user: any,
    @Body() createConsultationDto: CreateConsultationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.createMyConsultation(
      user.userId,
      createConsultationDto,
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
        case ConsultationErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.INVALID_CONSULTATION_DATE:
        case ConsultationErrors.CONSULTATION_DATE_IN_PAST:
        case ConsultationErrors.TIME_SLOT_NOT_AVAILABLE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('my-consultations')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all my consultations (Client)' })
  @ApiResponse({
    status: 200,
    description: 'List of my consultations',
    type: ConsultationListResponseDto,
  })
  public async findMyConsultations(@CurrentUser() user: any) {
    return this.consultationsService.findMyConsultations(user.userId);
  }

  @Get('my-consultations/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get my consultation by ID (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My consultation details',
    type: ConsultationDetailResponseDto,
  })
  public async findMyConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.findMyConsultation(
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.CUSTOMER_NOT_FOUND:
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

  @Patch('my-consultations/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Update my consultation (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My consultation updated',
  })
  public async updateMyConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.updateMyConsultation(
      user.userId,
      id,
      updateConsultationDto,
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case ConsultationErrors.INVALID_CONSULTATION_STATUS:
        case ConsultationErrors.INVALID_CONSULTATION_DATE:
        case ConsultationErrors.CONSULTATION_DATE_IN_PAST:
        case ConsultationErrors.TIME_SLOT_NOT_AVAILABLE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete('my-consultations/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Delete my consultation (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My consultation deleted',
  })
  public async deleteMyConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.deleteMyConsultation(
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case ConsultationErrors.CANNOT_CANCEL_CONSULTATION:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch('my-consultations/:id/cancel')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Cancel my consultation (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My consultation cancelled',
  })
  public async cancelMyConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelConsultationDto: CancelConsultationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.cancelMyConsultation(
      user.userId,
      id,
      cancelConsultationDto,
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case ConsultationErrors.CONSULTATION_ALREADY_CANCELLED:
        case ConsultationErrors.INVALID_CONSULTATION_STATUS_FOR_CANCELLATION:
        case ConsultationErrors.CANCELLATION_TOO_LATE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  // ===== Agent Endpoints =====

  @Get('pending')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pending consultations (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'List of pending consultations',
    type: ConsultationListResponseDto,
  })
  public async findPendingConsultations() {
    return this.consultationsService.findPendingConsultations();
  }

  @Get('assigned-to-me')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get my assigned consultations (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'List of my assigned consultations',
    type: ConsultationListResponseDto,
  })
  public async findMyAssignedConsultations(@CurrentUser() user: any) {
    return this.consultationsService.findMyAssignedConsultations(user.userId);
  }

  @Patch(':id/assign-to-me')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign consultation to me (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation assigned',
  })
  public async assignConsultationToMe(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.assignConsultationToMe(
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.AGENT_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.INVALID_CONSULTATION_STATUS:
        case ConsultationErrors.CONSULTATION_ALREADY_ASSIGNED:
        case ConsultationErrors.AGENT_NOT_AVAILABLE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch(':id/complete')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark consultation as completed (Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation completed',
  })
  public async completeConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.completeConsultation(
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
        case ConsultationErrors.AGENT_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case ConsultationErrors.INVALID_CONSULTATION_STATUS:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  // ===== Admin Endpoints =====

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all consultations (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of consultations',
    type: ConsultationListResponseDto,
  })
  public async findAll() {
    return this.consultationsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get consultation by ID (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation details',
    type: ConsultationDetailResponseDto,
  })
  public async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.findById(id);

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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update consultation (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation updated',
  })
  public async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.update(
      id,
      updateConsultationDto,
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete consultation (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation deleted',
  })
  public async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.delete(id);

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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete multiple consultations (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Consultations deleted',
  })
  public async deleteMany(
    @Body() deleteConsultationsDto: DeleteConsultationsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result =
      await this.consultationsService.deleteMany(deleteConsultationsDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
    }
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel consultation (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Consultation cancelled',
  })
  public async cancel(
    @Param('id') id: string,
    @Body() cancelConsultationDto: CancelConsultationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.consultationsService.cancelConsultation(
      id,
      cancelConsultationDto,
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
        case ConsultationErrors.CONSULTATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case ConsultationErrors.CONSULTATION_ALREADY_CANCELLED:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }
}
