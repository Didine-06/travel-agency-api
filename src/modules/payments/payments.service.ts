import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from './repository/payments.repository';
import { CreatePaymentDto, UpdatePaymentDto, DeletePaymentsDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { PaymentErrors } from './enums';
import { BookingsRepository } from '../bookings/repository/bookings.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly bookingsRepository: BookingsRepository,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    // Vérifier si le booking existe
    const booking = await this.bookingsRepository.findById(
      createPaymentDto.bookingId,
    );
    if (!booking) {
      return ErrorResponse(PaymentErrors.BOOKING_NOT_FOUND);
    }

    const payment = await this.paymentsRepository.create(createPaymentDto);
    return ApiResponse(payment);
  }

  async findAll() {
    const payments = await this.paymentsRepository.findAll();
    return ApiResponse(payments);
  }

  async findById(id: string) {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      return ErrorResponse(PaymentErrors.PAYMENT_NOT_FOUND);
    }

    return ApiResponse(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const existingPayment = await this.paymentsRepository.findById(id);
    if (!existingPayment) {
      return ErrorResponse(PaymentErrors.PAYMENT_NOT_FOUND);
    }

    const updatedPayment = await this.paymentsRepository.update(
      id,
      updatePaymentDto,
    );
    return ApiResponse(updatedPayment);
  }

  async delete(id: string) {
    const existingPayment = await this.paymentsRepository.findById(id);
    if (!existingPayment) {
      return ErrorResponse(PaymentErrors.PAYMENT_NOT_FOUND);
    }

    const deletedPayment = await this.paymentsRepository.delete(id);
    return ApiResponse(deletedPayment);
  }

  async deleteMany(deletePaymentsDto: DeletePaymentsDto) {
    const { ids } = deletePaymentsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(PaymentErrors.INVALID_PAYMENT_DATA);
    }

    const result = await this.paymentsRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }
}
