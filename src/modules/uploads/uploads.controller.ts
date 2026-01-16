import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('flight-tickets')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Upload a flight ticket attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFlightTicketAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadsService.uploadFile(file, 'flight-tickets');

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }

  @Post('general')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Upload a general file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGeneralFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadsService.uploadFile(file, 'general');

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }

  @Get(':category/:filename')
  @ApiOperation({ summary: 'Get uploaded file' })
  @ApiParam({ name: 'category', description: 'File category (e.g., flight-tickets, general)' })
  @ApiParam({ name: 'filename', description: 'File name' })
  async getFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const fileUrl = `/uploads/${category}/${filename}`;
    const fileData = this.uploadsService.getFileStream(fileUrl);

    if (!fileData) {
      throw new NotFoundException('File not found');
    }

    res.setHeader('Content-Type', fileData.mimeType);
    fileData.stream.pipe(res);
  }
}
