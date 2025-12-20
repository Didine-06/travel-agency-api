import { Module } from '@nestjs/common';
import { FlightTicketsController } from './flight-tickets.controller';
import { FlightTicketsService } from './flight-tickets.service';
import { FlightTicketsRepository } from './repository/flight-tickets.repository';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { BookingsRepository } from '../bookings/repository/bookings.repository';

@Module({
  controllers: [FlightTicketsController],
  providers: [
    FlightTicketsService,
    FlightTicketsRepository,
    CustomersRepository,
    BookingsRepository,
  ],
  exports: [FlightTicketsService, FlightTicketsRepository],
})
export class FlightTicketsModule {}
