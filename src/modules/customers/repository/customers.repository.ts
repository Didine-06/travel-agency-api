import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Customer> {
    const { userId, ...customerData } = data;
    
    return this.prisma.customer.create({
      data: {
        ...customerData,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { userId },
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Customer> {
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.customer.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
