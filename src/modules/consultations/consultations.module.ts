import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { AgentAvailabilitiesController } from './agent-availabilities.controller';
import { ConsultationsService } from './consultations.service';
import { AgentAvailabilitiesService } from './agent-availabilities.service';
import { ConsultationsRepository } from './repository/consultations.repository';
import { AgentAvailabilitiesRepository } from './repository/agent-availabilities.repository';
import { AgentsRepository } from './repository/agents.repository';
import { CustomersRepository } from '../customers/repository/customers.repository';

@Module({
  controllers: [ConsultationsController, AgentAvailabilitiesController],
  providers: [
    ConsultationsService,
    AgentAvailabilitiesService,
    ConsultationsRepository,
    AgentAvailabilitiesRepository,
    AgentsRepository,
    CustomersRepository,
  ],
  exports: [
    ConsultationsService,
    AgentAvailabilitiesService,
    ConsultationsRepository,
    AgentAvailabilitiesRepository,
    AgentsRepository,
  ],
})
export class ConsultationsModule {}
