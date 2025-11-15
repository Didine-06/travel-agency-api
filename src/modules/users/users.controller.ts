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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserDto,
  DeleteUsersDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé',
    type: UserResponseDto,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.usersService.create(createUserDto);

    if (result.isSuccess) {
      return res
        .status(HttpStatus.OK)
        .json(this.i18n.translateError('USER_CREATED_SUCCESSFULLY', lang));
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as UserErrors) {
        case UserErrors.USER_EMAIL_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(translatedMessage);
        case UserErrors.INVALID_USER_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Liste de tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    type: [UserResponseDto],
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour',
    type: UserResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.usersService.update(id, updateUserDto);

    if (result.isSuccess) {
      return res
        .status(HttpStatus.OK)
        .json(this.i18n.translateError('USER_UPDATED_SUCCESSFULLY', lang));
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as UserErrors) {
        case UserErrors.USER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        case UserErrors.USER_EMAIL_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(translatedMessage);
        case UserErrors.INVALID_USER_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé',
    type: UserResponseDto,
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.usersService.delete(id);

    if (result.isSuccess) {
      return res
        .status(HttpStatus.OK)
        .json(this.i18n.translateError('USER_DELETED_SUCCESSFULLY', lang));
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as UserErrors) {
        case UserErrors.USER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Supprimer plusieurs utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateurs supprimés',
  })
  async deleteMany(
    @Body() deleteUsersDto: DeleteUsersDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.usersService.deleteMany(deleteUsersDto);

    if (result.isSuccess) {
      return res
        .status(HttpStatus.OK)
        .json(this.i18n.translateError('USERS_DELETED_SUCCESSFULLY', lang));
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);

      switch (result.error as UserErrors) {
        case UserErrors.INVALID_USER_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(translatedMessage);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(translatedMessage);
      }
    }
  }
}
