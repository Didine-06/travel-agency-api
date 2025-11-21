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
import { DestinationsService } from './destinations.service';
import {
  CreateDestinationDto,
  DestinationResponseDto,
  UpdateDestinationDto,
  DeleteDestinationsDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { DestinationErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(
    private readonly destinationsService: DestinationsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle destination' })
  @ApiResponse({
    status: 201,
    description: 'Destination créée',
    type: DestinationResponseDto,
  })
  async create(
    @Body() createDestinationDto: CreateDestinationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.destinationsService.create(createDestinationDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as DestinationErrors) {
        case DestinationErrors.DESTINATION_COUNTRY_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(translatedMessage);
        case DestinationErrors.INVALID_DESTINATION_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Liste de toutes les destinations (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des destinations',
    type: [DestinationResponseDto],
  })
  async findAll() {
    return this.destinationsService.findAll();
  }

  @Get(':id')
  @UseGuards(UserLanguageGuard)
  @ApiOperation({ summary: 'Récupérer une destination par ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Destination trouvée',
    type: DestinationResponseDto,
  })
  async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.destinationsService.findById(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as DestinationErrors) {
        case DestinationErrors.DESTINATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une destination' })
  @ApiResponse({
    status: 200,
    description: 'Destination mise à jour',
    type: DestinationResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.destinationsService.update(
      id,
      updateDestinationDto,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as DestinationErrors) {
        case DestinationErrors.DESTINATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        case DestinationErrors.DESTINATION_COUNTRY_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(translatedMessage);
        case DestinationErrors.INVALID_DESTINATION_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une destination' })
  @ApiResponse({
    status: 200,
    description: 'Destination supprimée',
    type: DestinationResponseDto,
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.destinationsService.delete(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as DestinationErrors) {
        case DestinationErrors.DESTINATION_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer plusieurs destinations' })
  @ApiResponse({
    status: 200,
    description: 'Destinations supprimées',
  })
  async deleteMany(
    @Body() deleteDestinationsDto: DeleteDestinationsDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.destinationsService.deleteMany(
      deleteDestinationsDto,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as DestinationErrors) {
        case DestinationErrors.INVALID_DESTINATION_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }
}
