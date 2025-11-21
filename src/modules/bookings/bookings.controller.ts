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
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  BookingResponseDto,
  UpdateBookingDto,
  DeleteBookingsDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BookingErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created',
    type: BookingResponseDto,
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.create(createBookingDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as BookingErrors) {
        case BookingErrors.CUSTOMER_NOT_FOUND:
        case BookingErrors.PACKAGE_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.INVALID_BOOKING_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.PACKAGE_NOT_AVAILABLE:
          return res.status(HttpStatus.CONFLICT).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    type: [BookingResponseDto],
  })
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking found',
    type: BookingResponseDto,
  })
  async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.findById(id);

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
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated',
    type: BookingResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.update(id, updateBookingDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as BookingErrors) {
        case BookingErrors.BOOKING_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.INVALID_BOOKING_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking deleted',
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.delete(id);

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
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete multiple bookings' })
  @ApiResponse({
    status: 200,
    description: 'Bookings deleted',
  })
  async deleteMany(
    @Body() deleteBookingsDto: DeleteBookingsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.deleteMany(deleteBookingsDto);

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
