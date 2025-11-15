import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repository/users.repository';
import { LoginDto, RegisterDto, AuthResponseDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { AuthErrors } from './enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      return ErrorResponse(AuthErrors.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const authResponse: AuthResponseDto = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    return ApiResponse(authResponse);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) {
      return ErrorResponse(AuthErrors.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      return ErrorResponse(AuthErrors.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      return ErrorResponse(AuthErrors.UNAUTHORIZED);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const authResponse: AuthResponseDto = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
    };

    return ApiResponse(authResponse);
  }

  async validateUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.isActive) {
      return ErrorResponse(AuthErrors.USER_NOT_FOUND);
    }
    return ApiResponse(user);
  }
}
