import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Consultation, Prisma } from '@prisma/client';

@Injectable()
export class ConsultationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Consultation> {
    const { customerId, ...consultationData } = data;

    return await this.prisma.consultation.create({
      data: {
        ...consultationData,
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
        agent: {
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

  async findAll(): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
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
        agent: {
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

  async findById(id: string): Promise<Consultation | null> {
    return await this.prisma.consultation.findUnique({
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
        agent: {
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

  async findByCustomerId(customerId: string): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
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
        agent: {
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

  async findByAgentId(agentId: string): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      where: { agentId },
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
        agent: {
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

  async findPendingConsultations(): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      where: {
        status: 'PENDING',
        agentId: null,
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
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByIds(ids: string[]): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ConsultationUpdateInput,
  ): Promise<Consultation> {
    return await this.prisma.consultation.update({
      where: { id },
      data,
      include: {
        customer: true,
        agent: true,
      },
    });
  }

  async assignAgent(id: string, agentId: string): Promise<Consultation> {
    return await this.prisma.consultation.update({
      where: { id },
      data: {
        agentId,
        status: 'CONFIRMED',
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Consultation> {
    return await this.prisma.consultation.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return await this.prisma.consultation.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async countByCustomerId(customerId: string): Promise<number> {
    return await this.prisma.consultation.count({
      where: { customerId },
    });
  }

  async countByAgentId(agentId: string): Promise<number> {
    return await this.prisma.consultation.count({
      where: { agentId },
    });
  }

  async findConsultationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      where: {
        consultationDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        agent: true,
      },
    });
  }
}
