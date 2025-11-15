import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, UserLanguageGuard)
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
      return res.status(HttpStatus.CREATED).json(result);
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
}
