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
import { FlightTicketsService } from './flight-tickets.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { FlightTicketErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Flight Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('flight-tickets')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class FlightTicketsController {
  constructor(
    private readonly flightTicketsService: FlightTicketsService,
    private readonly i18n: I18nService,
  ) {}

  // ===== Admin/Agent Endpoints =====

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Create a new flight ticket (Admin/Agent)' })
  @ApiResponse({
    status: 201,
    description: 'Flight ticket created',
    type: FlightTicketResponseDto,
  })
  public async create(
    @Body() createFlightTicketDto: CreateFlightTicketDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result =
      await this.flightTicketsService.create(createFlightTicketDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
        case FlightTicketErrors.BOOKING_NOT_FOUND:
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.INVALID_TICKET_DATA:
        case FlightTicketErrors.INVALID_DATETIME:
        case FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all flight tickets (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'List of flight tickets',
    type: FlightTicketListResponseDto,
  })
  public async findAll() {
    return this.flightTicketsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get flight ticket by ID (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight ticket details',
    type: FlightTicketDetailResponseDto,
  })
  public async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.findById(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update flight ticket (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight ticket updated',
  })
  public async update(
    @Param('id') id: string,
    @Body() updateFlightTicketDto: UpdateFlightTicketDto,
    @CurrentUser() user: any,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.update(
      id,
      updateFlightTicketDto,
      user,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.INVALID_TICKET_DATA:
        case FlightTicketErrors.INVALID_DATETIME:
        case FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE:
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
  @ApiOperation({ summary: 'Delete flight ticket (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight ticket deleted',
  })
  public async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.delete(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete multiple flight tickets (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight tickets deleted',
  })
  public async deleteMany(
    @Body() deleteFlightTicketsDto: DeleteFlightTicketsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result =
      await this.flightTicketsService.deleteMany(deleteFlightTicketsDto);

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
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Cancel flight ticket (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight ticket cancelled',
  })
  public async cancel(
    @Param('id') id: string,
    @Body() cancelFlightTicketDto: CancelFlightTicketDto,
    @CurrentUser() user: any,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.cancelTicket(
      id,
      cancelFlightTicketDto,
      user,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.TICKET_ALREADY_CANCELLED:
        case FlightTicketErrors.INVALID_TICKET_STATUS_FOR_CANCELLATION:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch(':id/mark-as-paid')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Mark flight ticket as paid (Admin/Agent)' })
  @ApiResponse({
    status: 200,
    description: 'Flight ticket marked as paid',
  })
  public async markAsPaid(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.markAsPaid(id, user);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.TICKET_ALREADY_PAID:
        case FlightTicketErrors.INVALID_TICKET_STATUS_FOR_PAYMENT:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  // ===== Client Endpoints =====

  @Get('my-tickets')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all my flight tickets (Client)' })
  @ApiResponse({
    status: 200,
    description: 'List of my flight tickets',
    type: FlightTicketListResponseDto,
  })
  public async findMyTickets(@CurrentUser() user: any) {
    return this.flightTicketsService.findMyTickets(user.userId);
  }

  @Get('my-tickets/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get my flight ticket by ID (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My flight ticket details',
    type: FlightTicketDetailResponseDto,
  })
  public async findMyTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.findMyTicket(
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Post('my-tickets')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create my flight ticket (Client)' })
  @ApiResponse({
    status: 201,
    description: 'My flight ticket created',
    type: FlightTicketResponseDto,
  })
  public async createMyTicket(
    @CurrentUser() user: any,
    @Body() createMyFlightTicketDto: CreateMyFlightTicketDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.createMyTicket(
      user.userId,
      createMyFlightTicketDto,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
        case FlightTicketErrors.BOOKING_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.INVALID_TICKET_DATA:
        case FlightTicketErrors.INVALID_DATETIME:
        case FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch('my-tickets/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Update my flight ticket (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My flight ticket updated',
  })
  public async updateMyTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateMyFlightTicketDto: UpdateMyFlightTicketDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.updateMyTicket(
      user.userId,
      id,
      updateMyFlightTicketDto,
      user,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case FlightTicketErrors.INVALID_TICKET_STATUS:
        case FlightTicketErrors.INVALID_DATETIME:
        case FlightTicketErrors.ARRIVAL_BEFORE_DEPARTURE:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete('my-tickets/:id')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Delete my flight ticket (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My flight ticket deleted',
  })
  public async deleteMyTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.deleteMyTicket(
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case FlightTicketErrors.CANNOT_CANCEL_TICKET:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete('my-tickets')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Delete multiple my flight tickets (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My flight tickets deleted',
  })
  public async deleteMyTickets(
    @CurrentUser() user: any,
    @Body() deleteFlightTicketsDto: DeleteFlightTicketsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.deleteMyTickets(
      user.userId,
      deleteFlightTicketsDto,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case FlightTicketErrors.INVALID_TICKET_DATA:
        case FlightTicketErrors.CANNOT_CANCEL_TICKET:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Patch('my-tickets/:id/cancel')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Cancel my flight ticket (Client)' })
  @ApiResponse({
    status: 200,
    description: 'My flight ticket cancelled',
  })
  public async cancelMyTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelFlightTicketDto: CancelFlightTicketDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.flightTicketsService.cancelMyTicket(
      user.userId,
      id,
      cancelFlightTicketDto,
      user,
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

      switch (result.error as FlightTicketErrors) {
        case FlightTicketErrors.TICKET_NOT_FOUND:
        case FlightTicketErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case FlightTicketErrors.UNAUTHORIZED_ACCESS:
          return res.status(HttpStatus.FORBIDDEN).json(errorResponse);
        case FlightTicketErrors.TICKET_ALREADY_CANCELLED:
        case FlightTicketErrors.INVALID_TICKET_STATUS_FOR_CANCELLATION:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }
}
