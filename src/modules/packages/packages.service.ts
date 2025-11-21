import { Injectable } from '@nestjs/common';
import { PackagesRepository } from './repository/packages.repository';
import { CreatePackageDto, UpdatePackageDto, DeletePackagesDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { PackageErrors } from './enums';
import { DestinationsRepository } from '../destinations/repository/destinations.repository';

@Injectable()
export class PackagesService {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly destinationsRepository: DestinationsRepository,
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    const dest = await this.destinationsRepository.findById(
      createPackageDto.destinationId,
    );
    if (!dest) {
      return ErrorResponse(PackageErrors.INVALID_PACKAGE_DATA);
    }
    const packageData = await this.packagesRepository.create(createPackageDto);
    return ApiResponse(packageData);
  }

  async findAll() {
    const packages = await this.packagesRepository.findAll();
    return ApiResponse(packages);
  }

  async findById(id: string) {
    const packageData = await this.packagesRepository.findById(id);
    if (!packageData) {
      return ErrorResponse(PackageErrors.PACKAGE_NOT_FOUND);
    }

    return ApiResponse(packageData);
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    const existingPackage = await this.packagesRepository.findById(id);
    if (!existingPackage) {
      return ErrorResponse(PackageErrors.PACKAGE_NOT_FOUND);
    }

    const updatedPackage = await this.packagesRepository.update(
      id,
      updatePackageDto,
    );
    return ApiResponse(updatedPackage);
  }

  async delete(id: string) {
    const existingPackage = await this.packagesRepository.findById(id);
    if (!existingPackage) {
      return ErrorResponse(PackageErrors.PACKAGE_NOT_FOUND);
    }

    const deletedPackage = await this.packagesRepository.delete(id);
    return ApiResponse(deletedPackage);
  }

  async deleteMany(deletePackagesDto: DeletePackagesDto) {
    const { ids } = deletePackagesDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(PackageErrors.INVALID_PACKAGE_DATA);
    }

    const result = await this.packagesRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }
}
