import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, UpdateProfileDto } from './dtos';
import { AuthErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  @UseGuards(UserLanguageGuard)
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email déjà existant' })
  async register(
    @Body() registerDto: RegisterDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.register(registerDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as AuthErrors) {
        case AuthErrors.EMAIL_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(errorResponse);
        case AuthErrors.WEAK_PASSWORD:
        case AuthErrors.INVALID_EMAIL_FORMAT:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        case AuthErrors.REGISTRATION_FAILED:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Post('login')
  @UseGuards(UserLanguageGuard)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(
    @Body() loginDto: LoginDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as AuthErrors) {
        case AuthErrors.INVALID_CREDENTIALS:
        case AuthErrors.USER_NOT_FOUND:
        case AuthErrors.UNAUTHORIZED:
          return res.status(HttpStatus.UNAUTHORIZED).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer les informations de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Informations utilisateur récupérées',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getMe(
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const result = await this.authService.getMe(user.userId);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.UNAUTHORIZED).json(result);
  }

  @Patch('profile/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Éditer le profil utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    // Vérifier que l'utilisateur modifie son propre profil ou est admin
    if (user.userId !== userId && user.role !== 'ADMIN') {
      return res.status(HttpStatus.FORBIDDEN).json({
        isSuccess: false,
        isError: true,
        error: AuthErrors.FORBIDDEN,
        message: 'Vous ne pouvez modifier que votre propre profil',
      });
    }

    const result = await this.authService.updateProfile(userId, updateProfileDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.NOT_FOUND).json(result);
  }
}
