import { Injectable } from '@nestjs/common';
import { AgentAvailabilitiesRepository } from './repository/agent-availabilities.repository';
import { AgentsRepository } from './repository/agents.repository';
import { CreateAgentAvailabilityDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { ConsultationErrors } from './enums';

@Injectable()
export class AgentAvailabilitiesService {
  constructor(
    private readonly agentAvailabilitiesRepository: AgentAvailabilitiesRepository,
    private readonly agentsRepository: AgentsRepository,
  ) {}

  public async createMyAvailability(
    userId: string,
    createAgentAvailabilityDto: CreateAgentAvailabilityDto,
  ) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    // Validation du format de l'heure
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (
      !timeRegex.test(createAgentAvailabilityDto.startTime) ||
      !timeRegex.test(createAgentAvailabilityDto.endTime)
    ) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_DATA);
    }

    // Vérifier que startTime < endTime
    if (
      createAgentAvailabilityDto.startTime >=
      createAgentAvailabilityDto.endTime
    ) {
      return ErrorResponse(ConsultationErrors.INVALID_CONSULTATION_DATA);
    }

    const availability = await this.agentAvailabilitiesRepository.create(
      agent.id,
      createAgentAvailabilityDto,
    );

    return ApiResponse(availability);
  }

  public async findMyAvailabilities(userId: string) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const availabilities =
      await this.agentAvailabilitiesRepository.findByAgentId(agent.id);
    return ApiResponse({
      data: availabilities,
      total: availabilities.length,
    });
  }

  public async deleteMyAvailability(userId: string, availabilityId: string) {
    const agent = await this.agentsRepository.findByUserId(userId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const availability =
      await this.agentAvailabilitiesRepository.findById(availabilityId);
    if (!availability) {
      return ErrorResponse(ConsultationErrors.CONSULTATION_NOT_FOUND);
    }

    if (availability.agentId !== agent.id) {
      return ErrorResponse(ConsultationErrors.UNAUTHORIZED_ACCESS);
    }

    await this.agentAvailabilitiesRepository.delete(availabilityId);
    return ApiResponse({});
  }

  // Admin methods
  public async findAvailabilitiesByAgentId(agentId: string) {
    const agent = await this.agentsRepository.findById(agentId);
    if (!agent) {
      return ErrorResponse(ConsultationErrors.AGENT_NOT_FOUND);
    }

    const availabilities =
      await this.agentAvailabilitiesRepository.findByAgentId(agentId);
    return ApiResponse({
      data: availabilities,
      total: availabilities.length,
    });
  }

  public async findAvailableAgentsForSlot(dayOfWeek: number, time: string) {
    const availabilities =
      await this.agentAvailabilitiesRepository.findAvailableAgentsForDateTime(
        dayOfWeek,
        time,
      );
    return ApiResponse({
      data: availabilities,
      total: availabilities.length,
    });
  }
}
