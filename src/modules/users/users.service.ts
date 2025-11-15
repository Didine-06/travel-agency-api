import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserDto,
  DeleteUsersDto,
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { UserErrors } from './enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      return ErrorResponse(UserErrors.USER_EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const userData = this.excludePassword(user);
    return ApiResponse(userData);
  }

  async findAll() {
    const users = await this.usersRepository.findAll();
    const usersData = users.map((user) => this.excludePassword(user));
    return ApiResponse(usersData);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      return ErrorResponse(UserErrors.USER_NOT_FOUND);
    }

    const userData = this.excludePassword(user);
    return ApiResponse(userData);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      return ErrorResponse(UserErrors.USER_NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );
      if (emailExists) {
        return ErrorResponse(UserErrors.USER_EMAIL_ALREADY_EXISTS);
      }
    }

    const dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, dataToUpdate);
    const userData = this.excludePassword(updatedUser);
    return ApiResponse(userData);
  }

  async delete(id: string) {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      return ErrorResponse(UserErrors.USER_NOT_FOUND);
    }

    const deletedUser = await this.usersRepository.delete(id);
    const userData = this.excludePassword(deletedUser);
    return ApiResponse(userData);
  }

  async deleteMany(deleteUsersDto: DeleteUsersDto) {
    const { ids } = deleteUsersDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(UserErrors.INVALID_USER_DATA);
    }

    const result = await this.usersRepository.deleteMany(ids);
    return ApiResponse({ deletedCount: result.count });
  }

  private excludePassword(user: any): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
