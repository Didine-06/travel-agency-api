import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackagesRepository } from './repository/packages.repository';
import { DestinationsRepository } from '../destinations/repository/destinations.repository';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService, PackagesRepository, DestinationsRepository],
  exports: [PackagesService, PackagesRepository],
})
export class PackagesModule {}
