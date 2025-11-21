import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Package, Prisma } from '@prisma/client';

@Injectable()
export class PackagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Package> {
    const { destinationId, ...packageData } = data;

    return await this.prisma.package.create({
      data: {
        ...packageData,
        destination: {
          connect: { id: destinationId },
        },
      },
      include: {
        destination: true,
      },
    });
  }

  async findAll(): Promise<Package[]> {
    return await this.prisma.package.findMany({
      include: {
        destination: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Package | null> {
    return await this.prisma.package.findUnique({
      where: { id },
      include: {
        destination: true,
      },
    });
  }

  async update(id: string, data: Prisma.PackageUpdateInput): Promise<Package> {
    return await this.prisma.package.update({
      where: { id },
      data,
      include: {
        destination: true,
      },
    });
  }

  async delete(id: string): Promise<Package> {
    return await this.prisma.package.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await this.prisma.package.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
