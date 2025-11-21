import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './repository/payments.repository';
import { BookingsRepository } from '../bookings/repository/bookings.repository';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, BookingsRepository],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
