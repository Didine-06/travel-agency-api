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
import { PackagesService } from './packages.service';
import {
  CreatePackageDto,
  PackageResponseDto,
  UpdatePackageDto,
  DeletePackagesDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PackageErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Packages')
@ApiBearerAuth('JWT-auth')
@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
export class PackagesController {
  constructor(
    private readonly packagesService: PackagesService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({
    status: 201,
    description: 'Package created',
    type: PackageResponseDto,
  })
  async create(
    @Body() createPackageDto: CreatePackageDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.packagesService.create(createPackageDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(
        result.errorDetails,
        lang,
      );

      switch (result.error as PackageErrors) {
        case PackageErrors.INVALID_PACKAGE_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  @ApiResponse({
    status: 200,
    description: 'List of packages',
    type: [PackageResponseDto],
  })
  async findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID' })
  @ApiResponse({
    status: 200,
    description: 'Package found',
    type: PackageResponseDto,
  })
  async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.packagesService.findById(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(this.i18n.translateError(result.error, lang));
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update a package' })
  @ApiResponse({
    status: 200,
    description: 'Package updated',
    type: PackageResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.packagesService.update(id, updatePackageDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as PackageErrors) {
        case PackageErrors.PACKAGE_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        case PackageErrors.INVALID_PACKAGE_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete a package' })
  @ApiResponse({
    status: 200,
    description: 'Package deleted',
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.packagesService.delete(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
    }
  }

  @Delete()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete multiple packages' })
  @ApiResponse({
    status: 200,
    description: 'Packages deleted',
  })
  async deleteMany(
    @Body() deletePackagesDto: DeletePackagesDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.packagesService.deleteMany(deletePackagesDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
    }
  }
}
