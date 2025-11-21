import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Destination, Prisma } from '@prisma/client';

@Injectable()
export class DestinationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DestinationCreateInput): Promise<Destination> {
    return await this.prisma.destination.create({ data });
  }

  async findAll(): Promise<Destination[]> {
    return await this.prisma.destination.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Destination> {
    return await this.prisma.destination.findUnique({
      where: { id },
    });
  }

  async findByCountry(country: string): Promise<Destination> {
    return await this.prisma.destination.findFirst({
      where: { country },
    });
  }

  async update(
    id: string,
    data: Prisma.DestinationUpdateInput,
  ): Promise<Destination> {
    return await this.prisma.destination.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Destination> {
    return await this.prisma.destination.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await this.prisma.destination.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
