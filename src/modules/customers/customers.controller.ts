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
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
  DeleteCustomersDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CustomerErrors } from './enums';
import { UserLanguage } from '../../common/decorators/user-language.decorator';
import { I18nService } from '../../common/i18n';
import { UserLanguageGuard } from '../../common/guards/user-language.guard';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard, UserLanguageGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created',
    type: CustomerResponseDto,
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.customersService.create(createCustomerDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.CREATED).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as CustomerErrors) {
        case CustomerErrors.CUSTOMER_ALREADY_EXISTS:
          return res.status(HttpStatus.CONFLICT).json(errorResponse);
        case CustomerErrors.INVALID_CUSTOMER_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    type: [CustomerResponseDto],
  })
  async findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    type: CustomerResponseDto,
  })
  async findById(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.customersService.findById(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated',
    type: CustomerResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.customersService.update(id, updateCustomerDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      switch (result.error as CustomerErrors) {
        case CustomerErrors.CUSTOMER_NOT_FOUND:
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case CustomerErrors.INVALID_CUSTOMER_DATA:
          return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
        default:
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
      }
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted',
  })
  async delete(
    @Param('id') id: string,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.customersService.delete(id);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.NOT_FOUND).json(errorResponse);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple customers' })
  @ApiResponse({
    status: 200,
    description: 'Customers deleted',
  })
  async deleteMany(
    @Body() deleteCustomersDto: DeleteCustomersDto,
    @UserLanguage() lang: string,
    @Res() res: Response,
  ) {
    const result = await this.customersService.deleteMany(deleteCustomersDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    }

    if (result.isError && 'error' in result) {
      const translatedMessage = this.i18n.translateError(result.error, lang);
      const errorResponse = {
        ...result,
        message: translatedMessage,
      };

      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
    }
  }
}
