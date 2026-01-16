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
  CreateMyBookingDto,
  UpdateMyBookingDto,
  BookingListResponseDto,
  BookingDetailResponseDto,
  CancelBookingDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Create a new booking (Admin/Agent)' })
  @ApiResponse({
    status: 201,
    description: 'Booking created',
    type: BookingResponseDto,
  })
  public async create(
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

  @Post('my-booking')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a booking for current customer' })
  @ApiResponse({
    status: 201,
    description: 'Booking created',
    type: BookingResponseDto,
  })
  public async createMyBooking(
    @CurrentUser() user: any,
    @Body() createMyBookingDto: CreateMyBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.createMyBooking(
      user.userId,
      createMyBookingDto,
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
    type: [BookingListResponseDto],
  })
  public async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('customer/:customerId')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get bookings for a specific customer (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'List of customer bookings',
    type: [BookingListResponseDto],
  })
  public async getCustomerBookings(
    @Param('customerId') customerId: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.findByCustomerId(customerId);

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
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('my-bookings')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get bookings for the current customer' })
  @ApiResponse({
    status: 200,
    description: 'List of customer bookings',
    type: [BookingListResponseDto],
  })
  public async getMyBookings(
    @CurrentUser() user: any,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.findByUserId(user.userId);

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
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('my-booking/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get a specific booking for the current customer' })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingDetailResponseDto,
  })
  public async getMyBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.findMyBooking(user.userId, id);

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
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get booking by ID (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Booking found',
    type: BookingDetailResponseDto,
  })
  public async findById(
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

  @Patch('my-booking/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Update own booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated',
    type: BookingResponseDto,
  })
  public async updateMyBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateMyBookingDto: UpdateMyBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.updateMyBooking(
      user.userId,
      id,
      updateMyBookingDto,
      user, // Passer l'objet user pour le tracking
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

      switch (result.error as BookingErrors) {
        case BookingErrors.BOOKING_NOT_FOUND:
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.INVALID_BOOKING_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch('my-booking/:id/cancel')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Cancel own booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled',
  })
  public async cancelMyBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.cancelMyBooking(user.userId, id, cancelBookingDto);

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
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.BOOKING_ALREADY_CANCELLED:
        case BookingErrors.INVALID_BOOKING_STATUS_FOR_CANCELLATION:
        case BookingErrors.CANCELLATION_TOO_LATE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete('my-booking/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Delete own booking (hard delete)' })
  @ApiResponse({
    status: 200,
    description: 'Booking deleted',
  })
  public async deleteMyBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.deleteMyBooking(user.userId, id);

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
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.CANNOT_CANCEL_BOOKING:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete('my-bookings')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Delete multiple own bookings' })
  @ApiResponse({
    status: 200,
    description: 'Bookings deleted',
  })
  public async deleteMyBookings(
    @CurrentUser() user: any,
    @Body() deleteBookingsDto: DeleteBookingsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.deleteMyBookings(
      user.userId,
      deleteBookingsDto,
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

      switch (result.error as BookingErrors) {
        case BookingErrors.INVALID_BOOKING_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case BookingErrors.CANNOT_CANCEL_BOOKING:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case BookingErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update a booking (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated',
    type: BookingResponseDto,
  })
  public async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.update(id, updateBookingDto, user);

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

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Cancel a booking (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled',
  })
  public async cancelBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.bookingsService.cancelBooking(id, cancelBookingDto, user);

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
        case BookingErrors.BOOKING_ALREADY_CANCELLED:
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
  @ApiOperation({ summary: 'Delete a booking (hard delete)' })
  @ApiResponse({
    status: 200,
    description: 'Booking deleted',
  })
  public async delete(
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
  public async deleteMany(
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
