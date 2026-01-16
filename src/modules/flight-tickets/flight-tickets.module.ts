import { Module } from '@nestjs/common';
import { FlightTicketsController } from './flight-tickets.controller';
import { FlightTicketsService } from './flight-tickets.service';
import { FlightTicketsRepository } from './repository/flight-tickets.repository';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [FlightTicketsController],
  providers: [
    FlightTicketsService,
    FlightTicketsRepository,
    CustomersRepository,
  ],
  exports: [FlightTicketsService, FlightTicketsRepository],
})
export class FlightTicketsModule {}
