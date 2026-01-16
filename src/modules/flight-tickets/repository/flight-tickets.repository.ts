import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FlightTicket, Prisma } from '@prisma/client';

@Injectable()
export class FlightTicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<FlightTicket> {
    const { customerId, ...ticketData } = data;

    return await this.prisma.flightTicket.create({
      data: {
        ...ticketData,
        customer: {
          connect: { id: customerId },
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
      },
    });
  }

  async findAll(): Promise<FlightTicket[]> {
    return await this.prisma.flightTicket.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<FlightTicket | null> {
    return await this.prisma.flightTicket.findUnique({
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
      },
    });
  }

  async findByCustomerId(customerId: string): Promise<FlightTicket[]> {
    return await this.prisma.flightTicket.findMany({
      where: { customerId },
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIds(ids: string[]): Promise<FlightTicket[]> {
    return await this.prisma.flightTicket.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.FlightTicketUpdateInput,
  ): Promise<FlightTicket> {
    return await this.prisma.flightTicket.update({
      where: { id },
      data,
      include: {
        customer: true,
      },
    });
  }

  async delete(id: string): Promise<FlightTicket> {
    return await this.prisma.flightTicket.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await this.prisma.flightTicket.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async countByCustomerId(customerId: string): Promise<number> {
    return await this.prisma.flightTicket.count({
      where: { customerId },
    });
  }
}
