import { Injectable } from '@nestjs/common';
import { BookingsRepository } from './repository/bookings.repository';
import { 
  CreateBookingDto, 
  UpdateBookingDto, 
  DeleteBookingsDto, 
  CreateMyBookingDto, 
  UpdateMyBookingDto,
  BookingResponseDto,
  BookingListResponseDto,
  BookingDetailResponseDto,
  CancelBookingDto
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { BookingErrors } from './enums';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { PackagesRepository } from '../packages/repository/packages.repository';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly packagesRepository: PackagesRepository,
  ) {}

  public async create(createBookingDto: CreateBookingDto) {
    const customer = await this.customersRepository.findById(
      createBookingDto.customerId,
    );
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const packageData = await this.packagesRepository.findById(
      createBookingDto.packageId,
    );
    if (!packageData) {
      return ErrorResponse(BookingErrors.PACKAGE_NOT_FOUND);
    }

    const booking = await this.bookingsRepository.create(createBookingDto);
    return ApiResponse(booking);
  }

  public async findAll() {
    const bookings = await this.bookingsRepository.findAll();
    return ApiResponse(BookingListResponseDto.fromEntities(bookings));
  }

  public async findByUserId(userId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const bookings = await this.bookingsRepository.findByCustomerId(customer.id);
    return ApiResponse(BookingListResponseDto.fromEntities(bookings));
  }

  public async findByCustomerId(customerId: string) {
    const customer = await this.customersRepository.findById(customerId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const bookings = await this.bookingsRepository.findByCustomerId(customerId);
    return ApiResponse(BookingListResponseDto.fromEntities(bookings));
  }

  public async findMyBooking(userId: string, bookingId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    if (booking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    return ApiResponse(BookingDetailResponseDto.fromEntity(booking));
  }

  public async createMyBooking(userId: string, createMyBookingDto: CreateMyBookingDto) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const packageData = await this.packagesRepository.findById(
      createMyBookingDto.packageId,
    );
    if (!packageData) {
      return ErrorResponse(BookingErrors.PACKAGE_NOT_FOUND);
    }

    const createBookingDto: CreateBookingDto = {
      ...createMyBookingDto,
      customerId: customer.id,
    };

    const booking = await this.bookingsRepository.create(createBookingDto);
    return ApiResponse(BookingResponseDto.fromEntity(booking));
  }

  public async updateMyBooking(userId: string, bookingId: string, updateMyBookingDto: UpdateMyBookingDto, user?: any) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const existingBooking = await this.bookingsRepository.findById(bookingId);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    if (existingBooking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    const updatedByName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : undefined;

    await this.bookingsRepository.update(
      bookingId,
      {
        ...updateMyBookingDto,
        updatedBy: updatedByName
      },
    );
    return ApiResponse({});
  }

  public async deleteMyBooking(userId: string, bookingId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const existingBooking = await this.bookingsRepository.findById(bookingId);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    if (existingBooking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    if (existingBooking.status === BookingStatus.CONFIRMED) {
      return ErrorResponse(BookingErrors.CANNOT_CANCEL_BOOKING);
    }

    await this.bookingsRepository.delete(bookingId);
    return ApiResponse({});
  }

  public async deleteMyBookings(userId: string, deleteBookingsDto: DeleteBookingsDto) {
    const { ids } = deleteBookingsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(BookingErrors.INVALID_BOOKING_DATA);
    }

    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const bookings = await this.bookingsRepository.findByIds(ids);
    const unauthorizedBooking = bookings.find(
      (booking) => booking.customerId !== customer.id,
    );

    if (unauthorizedBooking) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    const confirmedBooking = bookings.find(
      (booking) => booking.status === BookingStatus.CONFIRMED,
    );

    if (confirmedBooking) {
      return ErrorResponse(BookingErrors.CANNOT_CANCEL_BOOKING);
    }

    const result = await this.bookingsRepository.deleteMany(ids);
    return ApiResponse({ count: result.count });
  }

  public async findById(id: string) {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    return ApiResponse(BookingDetailResponseDto.fromEntity(booking));
  }

  public async update(id: string, updateBookingDto: UpdateBookingDto, user?: any) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    const updatedByName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : undefined;

    await this.bookingsRepository.update(
      id,
      {
        ...updateBookingDto,
        updatedBy: updatedByName
      },
    );
    return ApiResponse({});
  }

  public async delete(id: string) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    await this.bookingsRepository.delete(id);
    return ApiResponse({});
  }

  public async deleteMany(deleteBookingsDto: DeleteBookingsDto) {
    const { ids } = deleteBookingsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(BookingErrors.INVALID_BOOKING_DATA);
    }

    const result = await this.bookingsRepository.deleteMany(ids);
    return ApiResponse({ count: result.count });
  }

  public async cancelMyBooking(userId: string, bookingId: string, cancelBookingDto: CancelBookingDto) {
    const MINIMUM_DAYS_BEFORE_TRAVEL = 7;

    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    const existingBooking = await this.bookingsRepository.findById(bookingId);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    if (existingBooking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    if (existingBooking.status === BookingStatus.CANCELLED) {
      return ErrorResponse(BookingErrors.BOOKING_ALREADY_CANCELLED);
    }

    if (existingBooking.status !== BookingStatus.PENDING && existingBooking.status !== BookingStatus.CONFIRMED) {
      return ErrorResponse(BookingErrors.INVALID_BOOKING_STATUS_FOR_CANCELLATION);
    }

    const now = new Date();
    const travelDate = new Date(existingBooking.travelDate);
    const daysDifference = Math.ceil((travelDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference < MINIMUM_DAYS_BEFORE_TRAVEL) {
      return ErrorResponse(BookingErrors.CANCELLATION_TOO_LATE);
    }

    await this.bookingsRepository.update(
      bookingId,
      {
        status: BookingStatus.CANCELLED,
        cancelledAt: now,
        cancellationReason: cancelBookingDto.cancellationReason,
      },
    );

    return ApiResponse({});
  }

  public async cancelBooking(id: string, cancelBookingDto: CancelBookingDto, user?: any) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    if (existingBooking.status === BookingStatus.CANCELLED) {
      return ErrorResponse(BookingErrors.BOOKING_ALREADY_CANCELLED);
    }

    const updatedByName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : undefined;

    await this.bookingsRepository.update(
      id,
      {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: cancelBookingDto.cancellationReason,
        updatedBy: updatedByName,
      },
    );

    return ApiResponse({});
  }
}
