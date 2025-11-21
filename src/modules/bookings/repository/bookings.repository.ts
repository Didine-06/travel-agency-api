import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Booking, Prisma } from '@prisma/client';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Booking> {
    const { customerId, packageId, ...bookingData } = data;

    return await this.prisma.booking.create({
      data: {
        ...bookingData,
        customer: {
          connect: { id: customerId },
        },
        package: {
          connect: { id: packageId },
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        package: {
          include: {
            destination: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        package: {
          include: {
            destination: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        package: {
          include: {
            destination: true,
          },
        },
        payments: true,
      },
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return await this.prisma.booking.update({
      where: { id },
      data,
      include: {
        customer: true,
        package: true,
      },
    });
  }

  async delete(id: string): Promise<Booking> {
    return await this.prisma.booking.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await this.prisma.booking.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
