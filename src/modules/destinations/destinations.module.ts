import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { DestinationsRepository } from './repository/destinations.repository';
import { DatabaseModule } from '../../database/database.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [DestinationsController],
  providers: [DestinationsService, DestinationsRepository],
  exports: [DestinationsService],
})
export class DestinationsModule {}
