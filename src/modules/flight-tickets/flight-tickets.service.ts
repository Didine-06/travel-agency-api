import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { UploadsService } from '../uploads/uploads.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class FlightTicketsService {
  private readonly appUrl: string;

  constructor(
    private readonly flightTicketsRepository: FlightTicketsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  // ===== Admin/Agent Methods =====

  public async create(createFlightTicketDto: CreateFlightTicketDto, file?: Express.Multer.File) {
    const customer = await this.customersRepository.findById(
      createFlightTicketDto.customerId,
    );
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    // Validate dates
    const departure = new Date(createFlightTicketDto.departureDateTime);

    if (isNaN(departure.getTime())) {
      return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
    }

    // Validate return date if it's a round trip
    if (createFlightTicketDto.isRoundTrip && createFlightTicketDto.returnDate) {
      const returnDate = new Date(createFlightTicketDto.returnDate);

      if (isNaN(returnDate.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      if (returnDate <= departure) {
        return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
      }
    }

    // Handle file upload if provided
    let attachmentPath: string | undefined;
    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'flight-tickets');
      if (uploadResult.isSuccess && 'data' in uploadResult) {
        attachmentPath = uploadResult.data.fileUrl;
      }
    }

    const ticket = await this.flightTicketsRepository.create({
      ...createFlightTicketDto,
      attachmentPath,
    });
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
    file?: Express.Multer.File,
    user?: any,
  ) {
    const existingTicket = await this.flightTicketsRepository.findById(id);
    if (!existingTicket) {
      return ErrorResponse(FlightTicketErrors.TICKET_NOT_FOUND);
    }

    // Validate dates if provided
    if (
      updateFlightTicketDto.departureDateTime ||
      updateFlightTicketDto.returnDate
    ) {
      const departure = new Date(
        updateFlightTicketDto.departureDateTime ||
          existingTicket.departureDateTime,
      );

      if (isNaN(departure.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      // Validate return date if provided or if it's a round trip
      const isRoundTrip = updateFlightTicketDto.isRoundTrip ?? existingTicket.isRoundTrip;
      const returnDate = updateFlightTicketDto.returnDate || existingTicket.returnDate;

      if (isRoundTrip && returnDate) {
        const returnDateTime = new Date(returnDate);

        if (isNaN(returnDateTime.getTime())) {
          return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
        }

        if (returnDateTime <= departure) {
          return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
        }
      }
    }

    // Handle file upload if provided
    let attachmentPath: string | undefined;
    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'flight-tickets');
      if (uploadResult.isSuccess && 'data' in uploadResult) {
        attachmentPath = uploadResult.data.fileUrl;
        // Optionally delete old file if it exists
        if (existingTicket.attachmentPath) {
          await this.uploadsService.deleteFile(existingTicket.attachmentPath);
        }
      }
    }

    await this.flightTicketsRepository.update(id, {
      ...updateFlightTicketDto,
      ...(attachmentPath && { attachmentPath }),
    });

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

    // Add backend URL to attachment path
    const ticketWithFullUrl = {
      ...ticket,
      attachmentPath: ticket.attachmentPath 
        ? `${this.appUrl}${ticket.attachmentPath}` 
        : ticket.attachmentPath,
    };

    return ApiResponse(ticketWithFullUrl);
  }

  public async createMyTicket(
    userId: string,
    createMyFlightTicketDto: CreateMyFlightTicketDto,
    file?: Express.Multer.File,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(FlightTicketErrors.CUSTOMER_NOT_FOUND);
    }

    // Validate dates
    const departure = new Date(createMyFlightTicketDto.departureDateTime);

    if (isNaN(departure.getTime())) {
      return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
    }

    // Validate return date if it's a round trip
    if (createMyFlightTicketDto.isRoundTrip && createMyFlightTicketDto.returnDate) {
      const returnDate = new Date(createMyFlightTicketDto.returnDate);

      if (isNaN(returnDate.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      if (returnDate <= departure) {
        return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
      }
    }

    // Handle file upload if provided
    let attachmentPath: string | undefined;
    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'flight-tickets');
      if (uploadResult.isSuccess && 'data' in uploadResult) {
        attachmentPath = uploadResult.data.fileUrl;
      }
    }

    const createFlightTicketDto: CreateFlightTicketDto = {
      ...createMyFlightTicketDto,
      customerId: customer.id,
    };

    const ticket = await this.flightTicketsRepository.create({
      ...createFlightTicketDto,
      attachmentPath,
    });
    return ApiResponse(ticket);
  }

  public async updateMyTicket(
    userId: string,
    ticketId: string,
    updateMyFlightTicketDto: UpdateMyFlightTicketDto,
    file?: Express.Multer.File,
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

    // Customer can only modify RESERVED tickets
    if (existingTicket.status !== TicketStatus.RESERVED) {
      return ErrorResponse(FlightTicketErrors.INVALID_TICKET_STATUS);
    }

    // Validate dates if provided
    if (
      updateMyFlightTicketDto.departureDateTime ||
      updateMyFlightTicketDto.returnDate
    ) {
      const departure = new Date(
        updateMyFlightTicketDto.departureDateTime ||
          existingTicket.departureDateTime,
      );

      if (isNaN(departure.getTime())) {
        return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
      }

      // Validate return date if provided or if it's a round trip
      const isRoundTrip = updateMyFlightTicketDto.isRoundTrip ?? existingTicket.isRoundTrip;
      const returnDate = updateMyFlightTicketDto.returnDate || existingTicket.returnDate;

      if (isRoundTrip && returnDate) {
        const returnDateTime = new Date(returnDate);

        if (isNaN(returnDateTime.getTime())) {
          return ErrorResponse(FlightTicketErrors.INVALID_DATETIME);
        }

        if (returnDateTime <= departure) {
          return ErrorResponse(FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE);
        }
      }
    }

    // Handle file upload if provided
    let attachmentPath: string | undefined;
    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'flight-tickets');
      if (uploadResult.isSuccess && 'data' in uploadResult) {
        attachmentPath = uploadResult.data.fileUrl;
        // Optionally delete old file if it exists
        if (existingTicket.attachmentPath) {
          await this.uploadsService.deleteFile(existingTicket.attachmentPath);
        }
      }
    }

    await this.flightTicketsRepository.update(ticketId, {
      ...updateMyFlightTicketDto,
      ...(attachmentPath && { attachmentPath }),
    });

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
      return ErrorResponse(FlightTicketErrors.CANNOT_DELETE_TICKET);
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
