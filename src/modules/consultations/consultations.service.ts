import { Injectable } from '@nestjs/common';
import { ConsultationsRepository } from './repository/consultations.repository';
import { AgentAvailabilitiesRepository } from './repository/agent-availabilities.repository';
import { AgentsRepository } from './repository/agents.repository';
import {
  CreateConsultationDto,
  UpdateConsultationDto,
  CancelConsultationDto,
  DeleteConsultationsDto,
} from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { ConsultationErrors } from './enums';
import { CustomersRepository } from '../customers/repository/customers.repository';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly consultationsRepository: ConsultationsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly agentsRepository: AgentsRepository,
    private readonly agentAvailabilitiesRepository: AgentAvailabilitiesRepository,
  ) {}

  // ===== Client Methods =====

  public async createMyConsultation(
    userId: string,
    createConsultationDto: CreateConsultationDto,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    // Validation de la date
    const consultationDate = new Date(createConsultationDto.consultationDate);
    const now = new Date();

    if (isNaN(consultationDate.getTime())) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_DATE);
    }

    if (consultationDate < now) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_DATE_IN_PAST);
    }

    // Vérifier qu'il y a des agents disponibles pour ce créneau
    const dayOfWeek = consultationDate.getDay();
    const time = consultationDate.toTimeString().substring(0, 5); // Format HH:mm

    const availableAgents =
      await this.agentAvailabilitiesRepository.findAvailableAgentsForDateTime(
        dayOfWeek,
        time,
      );

    if (availableAgents.length === 0) {
      return ErrorResponse(ConsultationErrors.TIME_SLOT_NOT_AVAILABLE);
    }

    const consultation = await this.consultationsRepository.create({
      ...createConsultationDto,
      customerId: customer.id,
    });

    return ApiResponse(consultation);
  }

  public async findMyConsultations(userId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    const consultations =
      await this.consultationsRepository.findByCustomerId(customer.id);
    return ApiResponse({
      data: consultations,
      total: consultations.length,
    });
  }

  public async findMyConsultation(userId: string, consultationId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.customerId !== customer.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    return ApiResponse(consultation);
  }

  public async updateMyConsultation(
    userId: string,
    consultationId: string,
    updateConsultationDto: UpdateConsultationDto,
  ) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.customerId !== customer.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    // Client ne peut modifier que les consultations PENDING
    if (consultation.status !== ConsultationStatus.PENDING) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_STATUS);
    }

    // Si la date est modifiée, valider
    if (updateConsultationDto.consultationDate) {
      const newDate = new Date(updateConsultationDto.consultationDate);
      const now = new Date();

      if (isNaN(newDate.getTime())) {
        return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_DATE);
      }

      if (newDate < now) {
        return ErrorResponse(ConsultationErrors.CONSULTATION_DATE_IN_PAST);
      }

      // Vérifier disponibilité agents
      const dayOfWeek = newDate.getDay();
      const time = newDate.toTimeString().substring(0, 5);

      const availableAgents =
        await this.agentAvailabilitiesRepository.findAvailableAgentsForDateTime(
          dayOfWeek,
          time,
        );

      if (availableAgents.length === 0) {
        return ErrorResponse(ConsultationErrors.TIME_SLOT_NOT_AVAILABLE);
      }
    }

    await this.consultationsRepository.update(
      consultationId,
      updateConsultationDto,
    );
    return ApiResponse({});
  }

  public async cancelMyConsultation(
    userId: string,
    consultationId: string,
    cancelConsultationDto: CancelConsultationDto,
  ) {
    const MINIMUM_HOURS_BEFORE_CONSULTATION = 24;

    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.customerId !== customer.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_ALREADY_CANCELLED);
    }

    if (
      consultation.status !== ConsultationStatus.PENDING &&
      consultation.status !== ConsultationStatus.CONFIRMED
    ) {
      return ErrorResponse(
        ConsultationErrors.INVALID_CONSULTATION_STATUS_FOR_CANCELLATION,
      );
    }

    // Vérifier le délai d'annulation
    const now = new Date();
    const consultationDate = new Date(consultation.consultationDate);
    const hoursDifference =
      (consultationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < MINIMUM_HOURS_BEFORE_CONSULTATION) {
      return ErrorResponse(ConsultationErrors.CANCELLATION_TOO_LATE);
    }

    await this.consultationsRepository.update(consultationId, {
      status: ConsultationStatus.CANCELLED,
      cancelledAt: now,
    });

    return ApiResponse({});
  }

  public async deleteMyConsultation(userId: string, consultationId: string) {
    const customer = await this.customersRepository.findByUserId(userId);
    if (!customer) {
      return ErrorResponse(ConsultationErrors.CUSTOMER_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.customerId !== customer.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    // Client ne peut supprimer que les consultations PENDING
    if (consultation.status !== ConsultationStatus.PENDING) {
      return ErrorResponse(ConsultationErrors.CANNOT_CANCEL_CONSULTATION);
    }

    await this.consultationsRepository.delete(consultationId);
    return ApiResponse({});
  }

  // ===== Agent Methods =====

  public async findPendingConsultations() {
    const consultations =
      await this.consultationsRepository.findPendingConsultations();
    return ApiResponse({
      data: consultations,
      total: consultations.length,
    });
  }

  public async findMyAssignedConsultations(userId: string) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const consultations =
      await this.consultationsRepository.findByAgentId(agent.id);
    return ApiResponse({
      data: consultations,
      total: consultations.length,
    });
  }

  public async assignConsultationToMe(userId: string, consultationId: string) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.status !== ConsultationStatus.PENDING) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_STATUS);
    }

    if (consultation.agentId) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_ALREADY_ASSIGNED);
    }

    // Vérifier que l'agent est disponible pour ce créneau
    const consultationDate = new Date(consultation.consultationDate);
    const dayOfWeek = consultationDate.getDay();
    const time = consultationDate.toTimeString().substring(0, 5);

    const agentAvailabilities =
      await this.agentAvailabilitiesRepository.findByAgentId(agent.id);

    const isAvailable = agentAvailabilities.some((availability) => {
      return (
        availability.dayOfWeek === dayOfWeek &&
        availability.startTime <= time &&
        availability.endTime > time
      );
    });

    if (!isAvailable) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_AVAILABLE);
    }

    await this.consultationsRepository.assignAgent(consultationId, agent.id);
    return ApiResponse({});
  }

  public async completeConsultation(userId: string, consultationId: string) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const consultation =
      await this.consultationsRepository.findById(consultationId);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.agentId !== agent.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    if (consultation.status !== ConsultationStatus.CONFIRMED) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_STATUS);
    }

    await this.consultationsRepository.update(consultationId, {
      status: ConsultationStatus.COMPLETED,
    });

    return ApiResponse({});
  }

  // ===== Admin Methods =====

  public async findAll() {
    const consultations = await this.consultationsRepository.findAll();
    return ApiResponse({
      data: consultations,
      total: consultations.length,
    });
  }

  public async findById(id: string) {
    const consultation = await this.consultationsRepository.findById(id);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }
    return ApiResponse(consultation);
  }

  public async update(
    id: string,
    updateConsultationDto: UpdateConsultationDto,
  ) {
    const consultation = await this.consultationsRepository.findById(id);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    await this.consultationsRepository.update(id, updateConsultationDto);
    return ApiResponse({});
  }

  public async delete(id: string) {
    const consultation = await this.consultationsRepository.findById(id);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    await this.consultationsRepository.delete(id);
    return ApiResponse({});
  }

  public async deleteMany(deleteConsultationsDto: DeleteConsultationsDto) {
    const { ids } = deleteConsultationsDto;

    if (!ids || ids.length === 0) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_DATA);
    }

    const result = await this.consultationsRepository.deleteMany(ids);
    return ApiResponse({ count: result.count });
  }

  public async cancelConsultation(
    id: string,
    cancelConsultationDto: CancelConsultationDto,
  ) {
    const consultation = await this.consultationsRepository.findById(id);
    if (!consultation) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_ALREADY_CANCELLED);
    }

    await this.consultationsRepository.update(id, {
      status: ConsultationStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    return ApiResponse({});
  }
}
