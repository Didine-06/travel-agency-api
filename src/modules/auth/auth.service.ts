import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repository/users.repository';
import { LoginDto, RegisterDto, AuthResponseDto, UpdateProfileDto } from './dtos';
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
    
    const { phone, address, city, country, dateOfBirth, ...userData } = registerDto;
    
    const user = await this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      customer: {
        create: {
          phone,
          address,
          city,
          country,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        },
      },
    });

    return ApiResponse({ message: AuthErrors.REGISTRATION_SUCCESS });
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

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    const accessToken = this.jwtService.sign(payload);

    const authResponse: AuthResponseDto = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.customer?.phone || undefined,
        address: user.customer?.address || undefined,
        dateOfBirth: user.customer?.dateOfBirth || undefined,
        city: user.customer?.city || undefined,
        country: user.customer?.country || undefined,
        customerId: user.customer?.id || undefined,
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

  async getMe(userId: string) {
    const user = await this.usersRepository.findByEmail(
      (await this.usersRepository.findById(userId))?.email || '',
    );

    if (!user || !user.isActive) {
      return ErrorResponse(AuthErrors.USER_NOT_FOUND);
    }

    // Si l'utilisateur est ADMIN ou AGENT, on ne retourne pas les infos customer
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      isActive: user.isActive,
      languageId: user.languageId,
      customer:
        user.role === 'CLIENT' && user.customer
          ? {
              id: user.customer.id,
              phone: user.customer.phone,
              address: user.customer.address,
              dateOfBirth: user.customer.dateOfBirth,
              city : user.customer.city,
              country : user.customer.country,
            }
          : null,
    };

    return ApiResponse(userResponse);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return ErrorResponse(AuthErrors.USER_NOT_FOUND);
    }

    // Séparer les données customer des données user
    const { phone, address, city, country, dateOfBirth, ...userData } = updateProfileDto;

    try {
      // Si c'est un CLIENT et qu'il y a des données customer
      if (user.role === 'CLIENT' && (phone !== undefined || address !== undefined || city !== undefined || country !== undefined || dateOfBirth !== undefined)) {
        // Mettre à jour l'utilisateur avec les données customer
        const updatedUser = await this.usersRepository.update(userId, {
          ...userData,
          customer: {
            upsert: {
              create: {
                phone,
                address,
                city,
                country,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              },
              update: {
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(country !== undefined && { country }),
                ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
                ...(city !== undefined && { city }),
                ...(country !== undefined && { country }),
              },
            },
          },
        });

        // Récupérer l'utilisateur mis à jour avec les infos customer
        const userWithCustomer = await this.usersRepository.findByEmail(updatedUser.email);

        return ApiResponse({
          id: userWithCustomer.id,
          email: userWithCustomer.email,
          role: userWithCustomer.role,
          firstName: userWithCustomer.firstName,
          lastName: userWithCustomer.lastName,
          isActive: userWithCustomer.isActive,
          languageId: userWithCustomer.languageId,
          customer: userWithCustomer.customer ? {
            id: userWithCustomer.customer.id,
            phone: userWithCustomer.customer.phone,
            address: userWithCustomer.customer.address,
            city: userWithCustomer.customer.city,
            country: userWithCustomer.customer.country,
            dateOfBirth: userWithCustomer.customer.dateOfBirth,
          } : null,
        });
      } else {
        // Mettre à jour uniquement les données user (ADMIN/AGENT)
        const updatedUser = await this.usersRepository.update(userId, userData);

        return ApiResponse({
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isActive: updatedUser.isActive,
          languageId: updatedUser.languageId,
          customer: null,
        });
      }
    } catch (error) {
      return ErrorResponse(AuthErrors.USER_UPDATE_FAILED);
    }
  }
}
