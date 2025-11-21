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
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  UpdatePaymentDto,
  DeletePaymentsDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created',
    type: PaymentResponseDto,
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.create(createPaymentDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as PaymentErrors) {
        case PaymentErrors.INVALID_PAYMENT_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case PaymentErrors.BOOKING_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
    type: [PaymentResponseDto],
  })
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: PaymentResponseDto,
  })
  async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.findById(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated',
    type: PaymentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.update(id, updatePaymentDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as PaymentErrors) {
        case PaymentErrors.PAYMENT_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case PaymentErrors.INVALID_PAYMENT_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment deleted',
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.delete(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple payments' })
  @ApiResponse({
    status: 200,
    description: 'Payments deleted',
  })
  async deleteMany(
    @Body() deletePaymentsDto: DeletePaymentsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.deleteMany(deletePaymentsDto);

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
}
