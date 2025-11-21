import { Injectable } from '@nestjs/common';
import { DestinationsRepository } from './repository/destinations.repository';
import {
  CreateDestinationDto,
  UpdateDestinationDto,
  DeleteDestinationsDto,
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { DestinationErrors } from './enums';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly destinationsRepository: DestinationsRepository,
  ) {}

  async create(createDestinationDto: CreateDestinationDto) {
    const existingDestination = await this.destinationsRepository.findByCountry(
      createDestinationDto.country,
    );
    if (existingDestination) {
      return ErrorResponse(
        DestinationErrors.DESTINATION_COUNTRY_ALREADY_EXISTS,
      );
    }

    const destination =
      await this.destinationsRepository.create(createDestinationDto);
    return ApiResponse(destination);
  }

  async findAll() {
    const destinations = await this.destinationsRepository.findAll();
    return ApiResponse(destinations);
  }

  async findById(id: string) {
    const destination = await this.destinationsRepository.findById(id);
    if (!destination) {
      return ErrorResponse(DestinationErrors.DESTINATION_NOT_FOUND);
    }

    return ApiResponse(destination);
  }

  async update(id: string, updateDestinationDto: UpdateDestinationDto) {
    const existingDestination = await this.destinationsRepository.findById(id);
    if (!existingDestination) {
      return ErrorResponse(DestinationErrors.DESTINATION_NOT_FOUND);
    }

    if (
      updateDestinationDto.country &&
      updateDestinationDto.country !== existingDestination.country
    ) {
      const countryExists = await this.destinationsRepository.findByCountry(
        updateDestinationDto.country,
      );
      if (countryExists) {
        return ErrorResponse(
          DestinationErrors.DESTINATION_COUNTRY_ALREADY_EXISTS,
        );
      }
    }

    const updatedDestination = await this.destinationsRepository.update(
      id,
      updateDestinationDto,
    );
    return ApiResponse(updatedDestination);
  }

  async delete(id: string) {
    const existingDestination = await this.destinationsRepository.findById(id);
    if (!existingDestination) {
      return ErrorResponse(DestinationErrors.DESTINATION_NOT_FOUND);
    }

    const deletedDestination = await this.destinationsRepository.delete(id);
    return ApiResponse(deletedDestination);
  }

  async deleteMany(deleteDestinationsDto: DeleteDestinationsDto) {
    const { ids } = deleteDestinationsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(DestinationErrors.INVALID_DESTINATION_DATA);
    }

    const result = await this.destinationsRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }
}
