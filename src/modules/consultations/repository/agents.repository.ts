import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Agent } from '@prisma/client';

@Injectable()
export class AgentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any): Promise<Agent> {
    return await this.prisma.agent.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findAll(): Promise<Agent[]> {
    return await this.prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Agent | null> {
    return await this.prisma.agent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Agent | null> {
    return await this.prisma.agent.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<Agent> {
    return await this.prisma.agent.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async delete(id: string): Promise<Agent> {
    return await this.prisma.agent.delete({
      where: { id },
    });
  }
}
