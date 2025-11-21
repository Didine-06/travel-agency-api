import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './repository/customers.repository';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  DeleteCustomersDto,
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { CustomerErrors } from './enums';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.customersRepository.findByUserId(
      createCustomerDto.userId,
    );
    if (existingCustomer) {
      return ErrorResponse(CustomerErrors.CUSTOMER_ALREADY_EXISTS);
    }

    try {
      const customer = await this.customersRepository.create(createCustomerDto);
      return ApiResponse(customer);
    } catch (error) {
      return ErrorResponse(CustomerErrors.USER_NOT_FOUND);
    }
  }

  async findAll() {
    const customers = await this.customersRepository.findAll();
    return ApiResponse(customers);
  }

  async findById(id: string) {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      return ErrorResponse(CustomerErrors.CUSTOMER_NOT_FOUND);
    }

    return ApiResponse(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.customersRepository.findById(id);
    if (!existingCustomer) {
      return ErrorResponse(CustomerErrors.CUSTOMER_NOT_FOUND);
    }

    const updatedCustomer = await this.customersRepository.update(
      id,
      updateCustomerDto,
    );
    return ApiResponse(updatedCustomer);
  }

  async delete(id: string) {
    const existingCustomer = await this.customersRepository.findById(id);
    if (!existingCustomer) {
      return ErrorResponse(CustomerErrors.CUSTOMER_NOT_FOUND);
    }

    const deletedCustomer = await this.customersRepository.delete(id);
    return ApiResponse(deletedCustomer);
  }

  async deleteMany(deleteCustomersDto: DeleteCustomersDto) {
    const { ids } = deleteCustomersDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(CustomerErrors.INVALID_CUSTOMER_DATA);
    }

    const result = await this.customersRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }
}
