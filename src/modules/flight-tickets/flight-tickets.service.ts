import { Injectable } from '@nestjs/common';
import { FlightTicketsRepository } from './repository/flight-tickets.repository';
import {
  CreateFlightTicketDto,
  CreateMyFlightTicketDto,
  UpdateFlightTicketDto,
  UpdateMyFlightTicketDto,
  FlightTicketResponseDto,
  FlightTicketListResponseDto,
  FlightTicketDetailResponseDto,
  CancelFlightTicketDto,
  DeleteFlightTicketsDto,
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { FlightTicketErrors } from './enums';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { BookingsRepository } from '../bookings/repository/bookings.repository';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class FlightTicketsService {
  constructor(
    private readonly flightTicketsRepository: FlightTicketsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly bookingsRepository: BookingsRepository,
  ) {}

  // ===== Admin/Agent Methods =====

  public async create(createFlightTicketDto: CreateFlightTicketDto) {
    const customer = await this.customersRepository.findById(
      createFlightTicketDto.customerId,
    );
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const booking = await this.bookingsRepository.findById(
      createFlightTicketDto.bookingId,
    );
    if (!booking) {
      return ErrorResponse(FlightTicketErrors.BOOKING_NOT_FOUND);
    }

    // Validation des dates
    const departure = new Date(createFlightTicketDto.departureDateTime);
    const arrival = new Date(createFlightTicketDto.arrivalDateTime);

    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
      return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
    }

    if (arrival <= departure) {
      return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
    }

    const ticket = await this.flightTicketsRepository.create(
      createFlightTicketDto,
    );
    return ApiResponse(ticket);
  }

  public async findAll() {
    const tickets = await this.flightTicketsRepository.findAll();
    return ApiResponse(tickets);
  }

  public async findById(id: string) {
    const ticket = await this.flightTicketsRepository.findById(id);
    if (!ticket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    return ApiResponse(ticket);
  }

  public async update(
    id: string,
    updateFlightTicketDto: UpdateFlightTicketDto,
    user?: any,
  ) {
    const existingTicket = await this.flightTicketsRepository.findById(id);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    // Validation des dates si fournies
    if (
      updateFlightTicketDto.departureDateTime ||
      updateFlightTicketDto.arrivalDateTime
    ) {
      const departure = new Date(
        updateFlightTicketDto.departureDateTime ||
          existingTicket.departureDateTime,
      );
      const arrival = new Date(
        updateFlightTicketDto.arrivalDateTime || existingTicket.arrivalDateTime,
      );

      if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      if (arrival <= departure) {
        return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
      }
    }

    await this.flightTicketsRepository.update(id, updateFlightTicketDto);

    return ApiResponse({});
  }

  public async delete(id: string) {
    const existingTicket = await this.flightTicketsRepository.findById(id);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    await this.flightTicketsRepository.delete(id);
    return ApiResponse({});
  }

  public async deleteMany(deleteFlightTicketsDto: DeleteFlightTicketsDto) {
    const { ids } = deleteFlightTicketsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(FlightTicketErrors.INVALID_TICKET_DATA);
    }

    const result = await this.flightTicketsRepository.deleteMany(ids);
    return ApiResponse({ count: result.count });
  }

  public async cancelTicket(
    id: string,
    cancelFlightTicketDto: CancelFlightTicketDto,
    user?: any,
  ) {
    const existingTicket = await this.flightTicketsRepository.findById(id);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (existingTicket.status === TicketStatus.CANCELLED) {
      return ErrorResponse(FlightTicketErrors.TICKET_ALREADY_CANCELLED);
    }

    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(
        FlightTicketErrors.INVALID_TICKET_STATUS_FOR_CANCELLATION,
      );
    }

    await this.flightTicketsRepository.update(id, {
      status: TicketStatus.CANCELLED,
    });

    return ApiResponse({});
  }

  public async markAsPaid(id: string, user?: any) {
    const existingTicket = await this.flightTicketsRepository.findById(id);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (existingTicket.status === TicketStatus.PAID) {
      return ErrorResponse(FlightTicketErrors.TICKET_ALREADY_PAID);
    }

    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(
        FlightTicketErrors.INVALID_TICKET_STATUS_FOR_PAYMENT,
      );
    }

    await this.flightTicketsRepository.update(id, {
      status: TicketStatus.PAID,
    });

    return ApiResponse({});
  }

  // ===== Client Methods =====

  public async findMyTickets(userId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const tickets =
      await this.flightTicketsRepository.findByCustomerId(customer.id);
    return ApiResponse(tickets);
  }

  public async findMyTicket(userId: string, ticketId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const ticket = await this.flightTicketsRepository.findById(ticketId);
    if (!ticket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (ticket.customerId !== customer.id) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    return ApiResponse(ticket);
  }

  public async createMyTicket(
    userId: string,
    createMyFlightTicketDto: CreateMyFlightTicketDto,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const booking = await this.bookingsRepository.findById(
      createMyFlightTicketDto.bookingId,
    );
    if (!booking) {
      return ErrorResponse(FlightTicketErrors.BOOKING_NOT_FOUND);
    }

    // Vérifier que la réservation appartient au client
    if (booking.customerId !== customer.id) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    // Validation des dates
    const departure = new Date(createMyFlightTicketDto.departureDateTime);
    const arrival = new Date(createMyFlightTicketDto.arrivalDateTime);

    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
      return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
    }

    if (arrival <= departure) {
      return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
    }

    const createFlightTicketDto: CreateFlightTicketDto = {
      ...createMyFlightTicketDto,
      customerId: customer.id,
    };

    const ticket = await this.flightTicketsRepository.create(
      createFlightTicketDto,
    );
    return ApiResponse(ticket);
  }

  public async updateMyTicket(
    userId: string,
    ticketId: string,
    updateMyFlightTicketDto: UpdateMyFlightTicketDto,
    user?: any,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const existingTicket =
      await this.flightTicketsRepository.findById(ticketId);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (existingTicket.customerId !== customer.id) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    // Le client ne peut modifier que les billets RESERVED
    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(FlightTicketErrors.INVALID_TICKET_STATUS);
    }

    // Validation des dates si fournies
    if (
      updateMyFlightTicketDto.departureDateTime ||
      updateMyFlightTicketDto.arrivalDateTime
    ) {
      const departure = new Date(
        updateMyFlightTicketDto.departureDateTime ||
          existingTicket.departureDateTime,
      );
      const arrival = new Date(
        updateMyFlightTicketDto.arrivalDateTime ||
          existingTicket.arrivalDateTime,
      );

      if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      if (arrival <= departure) {
        return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
      }
    }

    await this.flightTicketsRepository.update(ticketId, updateMyFlightTicketDto);

    return ApiResponse({});
  }

  public async deleteMyTicket(userId: string, ticketId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const existingTicket =
      await this.flightTicketsRepository.findById(ticketId);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (existingTicket.customerId !== customer.id) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    // Le client ne peut supprimer que les billets RESERVED
    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(FlightTicketErrors.CANNOT_CANCEL_TICKET);
    }

    await this.flightTicketsRepository.delete(ticketId);
    return ApiResponse({});
  }

  public async deleteMyTickets(
    userId: string,
    deleteFlightTicketsDto: DeleteFlightTicketsDto,
  ) {
    const { ids } = deleteFlightTicketsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(FlightTicketErrors.INVALID_TICKET_DATA);
    }

    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const tickets = await this.flightTicketsRepository.findByIds(ids);
    const unauthorizedTicket = tickets.find(
      (ticket) => ticket.customerId !== customer.id,
    );

    if (unauthorizedTicket) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    const invalidTicket = tickets.find(
      (ticket) => ticket.status !== TicketStatus.RESERVED,
    );

    if (invalidTicket) {
      return ErrorResponse(FlightTicketErrors.CANNOT_CANCEL_TICKET);
    }

    const result = await this.flightTicketsRepository.deleteMany(ids);
    return ApiResponse({ count: result.count });
  }

  public async cancelMyTicket(
    userId: string,
    ticketId: string,
    cancelFlightTicketDto: CancelFlightTicketDto,
    user?: any,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    const existingTicket =
      await this.flightTicketsRepository.findById(ticketId);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    if (existingTicket.customerId !== customer.id) {
      return ErrorResponse(FlightTicketErrors.UNAUTHORIZED_ACCESS);
    }

    if (existingTicket.status === TicketStatus.CANCELLED) {
      return ErrorResponse(FlightTicketErrors.TICKET_ALREADY_CANCELLED);
    }

    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(
        FlightTicketErrors.INVALID_TICKET_STATUS_FOR_CANCELLATION,
      );
    }

    await this.flightTicketsRepository.update(ticketId, {
      status: TicketStatus.CANCELLED,
    });

    return ApiResponse({});
  }
}
