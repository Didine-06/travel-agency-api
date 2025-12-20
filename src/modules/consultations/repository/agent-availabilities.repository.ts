import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AgentAvailability } from '@prisma/client';

@Injectable()
export class AgentAvailabilitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(agentId: string, data: any): Promise<AgentAvailability> {
    return await this.prisma.agentAvailability.create({
      data: {
        ...data,
        agent: {
          connect: { id: agentId },
        },
      },
    });
  }

  async findByAgentId(agentId: string): Promise<AgentAvailability[]> {
    return await this.prisma.agentAvailability.findMany({
      where: { agentId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByDayOfWeek(dayOfWeek: number): Promise<AgentAvailability[]> {
    return await this.prisma.agentAvailability.findMany({
      where: { dayOfWeek },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<AgentAvailability | null> {
    return await this.prisma.agentAvailability.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<AgentAvailability> {
    return await this.prisma.agentAvailability.delete({
      where: { id },
    });
  }

  async deleteByAgentId(agentId: string): Promise<{ count: number }> {
    return await this.prisma.agentAvailability.deleteMany({
      where: { agentId },
    });
  }

  async findAvailableAgentsForDateTime(
    dayOfWeek: number,
    time: string,
  ): Promise<AgentAvailability[]> {
    return await this.prisma.agentAvailability.findMany({
      where: {
        dayOfWeek,
        startTime: {
          lte: time,
        },
        endTime: {
          gt: time,
        },
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
