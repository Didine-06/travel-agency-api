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
  BookingDetailResponseDto
} from './dtos';
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
    return ApiResponse(BookingListResponseDto.fromEntities(bookings));
  }

  async findByUserId(userId: string) {
    // Récupérer le customer associé au user
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    // Récupérer tous les bookings du customer
    const bookings = await this.bookingsRepository.findByCustomerId(customer.id);
    return ApiResponse(BookingListResponseDto.fromEntities(bookings));
  }

  public async findMyBooking(userId: string, bookingId: string) {
    // Récupérer le customer associé au user
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    // Récupérer la réservation
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    // Vérifier que la réservation appartient bien au customer
    if (booking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    return ApiResponse(BookingDetailResponseDto.fromEntity(booking));
  }

  async createMyBooking(userId: string, createMyBookingDto: CreateMyBookingDto) {
    // Récupérer le customer associé au user
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    // Vérifier si le package existe
    const packageData = await this.packagesRepository.findById(
      createMyBookingDto.packageId,
    );
    if (!packageData) {
      return ErrorResponse(BookingErrors.PACKAGE_NOT_FOUND);
    }

    // Créer la réservation avec le customerId récupéré
    const createBookingDto: CreateBookingDto = {
      ...createMyBookingDto,
      customerId: customer.id,
    };

    const booking = await this.bookingsRepository.create(createBookingDto);
    return ApiResponse(BookingResponseDto.fromEntity(booking));
  }

  async updateMyBooking(userId: string, bookingId: string, updateMyBookingDto: UpdateMyBookingDto) {
    // Récupérer le customer associé au user
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(BookingErrors.CUSTOMER_NOT_FOUND);
    }

    // Vérifier si la réservation existe
    const existingBooking = await this.bookingsRepository.findById(bookingId);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    // Vérifier que la réservation appartient bien au customer
    if (existingBooking.customerId !== customer.id) {
      return ErrorResponse(BookingErrors.UNAUTHORIZED_ACCESS);
    }

    // Mettre à jour la réservation
    const updatedBooking = await this.bookingsRepository.update(
      bookingId,
      updateMyBookingDto,
    );
    return ApiResponse(BookingResponseDto.fromEntity(updatedBooking));
  }

  async findById(id: string) {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    return ApiResponse(BookingDetailResponseDto.fromEntity(booking));
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
    return ApiResponse(BookingResponseDto.fromEntity(updatedBooking));
  }

  async delete(id: string) {
    const existingBooking = await this.bookingsRepository.findById(id);
    if (!existingBooking) {
      return ErrorResponse(BookingErrors.BOOKING_NOT_FOUND);
    }

    const deletedBooking = await this.bookingsRepository.delete(id);
    return ApiResponse(BookingResponseDto.fromEntity(deletedBooking));
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
