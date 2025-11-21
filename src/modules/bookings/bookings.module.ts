import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './repository/bookings.repository';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { PackagesRepository } from '../packages/repository/packages.repository';

@Module({
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsRepository,
    CustomersRepository,
    PackagesRepository,
  ],
  exports: [BookingsService, BookingsRepository],
})
export class BookingsModule {}
