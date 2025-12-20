import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { User, Prisma } from '@prisma/client';

type UserWithCustomer = User & {
  customer: {
    id: string;
    phone: string | null;
    address: string | null;
    dateOfBirth: Date | null;
    country: string | null;
    city: string | null;
  } | null;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(): Promise<UserWithCustomer[]> {
    return await this.prisma.user.findMany({
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            country: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<UserWithCustomer | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            country: true,
            city: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithCustomer | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            country: true,
            city: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
