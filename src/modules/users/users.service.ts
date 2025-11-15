import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { CreateUserDto, UserResponseDto } from './dtos';
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

  private excludePassword(user: any): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
