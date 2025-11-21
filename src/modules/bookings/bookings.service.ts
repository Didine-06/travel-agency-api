import { Injectable } from '@nestjs/common';
import { BookingsRepository } from './repository/bookings.repository';
import { CreateBookingDto, UpdateBookingDto, DeleteBookingsDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { BookingErrors } from './enums';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { PackagesRepository } from '../packages/repository/packages.repository';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly packagesRepository: PackagesRepository,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    // Vérifier si le customer existe
    const customer = await this.customersRepository.findById(
      createBookingDto.customerId,
    );
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    // Vérifier si le package existe
    const packageData = await this.packagesRepository.findById(
      createBookingDto.packageId,
    );
    if (!packageData) {
      return ErrorResponse(BookingErrors.PACKAGE_NOT_FOUND);
    }

    const booking = await this.bookingsRepository.create(createBookingDto);
    return ApiResponse(booking);
  }

  async findAll() {
    const bookings = await this.bookingsRepository.findAll();
    return ApiResponse(bookings);
  }

  async findById(id: string) {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    return ApiResponse(booking);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    const updatedBooking = await this.bookingsRepository.update(
      id,
      updateBookingDto,
    );
    return ApiResponse(updatedBooking);
  }

  async delete(id: string) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    const deletedBooking = await this.bookingsRepository.delete(id);
    return ApiResponse(deletedBooking);
  }

  async deleteMany(deleteBookingsDto: DeleteBookingsDto) {
    const { ids } = deleteBookingsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(BookingErrors.INVALID_BOOKING_DATA);
    }

    const result = await this.bookingsRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }
}
