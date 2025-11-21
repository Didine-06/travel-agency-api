import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Payment, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Payment> {
    const { bookingId, ...paymentData } = data;
    
    return this.prisma.payment.create({
      data: {
        ...paymentData,
        booking: {
          connect: { id: bookingId },
        },
      },
      include: {
        booking: {
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
            package: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: {
        booking: {
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
            package: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
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
            package: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<Payment> {
    const { bookingId, ...paymentData } = data;
    
    const updateData: any = { ...paymentData };
    
    if (bookingId) {
      updateData.booking = {
        connect: { id: bookingId },
      };
    }
    
    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        booking: true,
      },
    });
  }

  async delete(id: string): Promise<Payment> {
    return this.prisma.payment.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.payment.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
