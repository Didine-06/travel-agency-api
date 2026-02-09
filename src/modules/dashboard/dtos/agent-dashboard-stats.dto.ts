import { ApiProperty } from '@nestjs/swagger';

class AgentConsultationStatsDto {
  @ApiProperty({ description: 'Total consultations assigned to this agent' })
  total: number;

  @ApiProperty({ description: 'Pending unassigned consultations (global pool)' })
  pending: number;

  @ApiProperty({ description: 'Consultations assigned to this agent (confirmed)' })
  assignedToMe: number;

  @ApiProperty({ description: 'Consultations completed by this agent' })
  completed: number;
}

class AgentBookingStatsDto {
  @ApiProperty({ description: 'Total bookings' })
  total: number;

  @ApiProperty({ description: 'Pending bookings' })
  pending: number;

  @ApiProperty({ description: 'Confirmed bookings' })
  confirmed: number;

  @ApiProperty({ description: 'Cancelled bookings' })
  cancelled: number;
}

class AgentPackageStatsDto {
  @ApiProperty({ description: 'Total packages' })
  total: number;

  @ApiProperty({ description: 'Active packages' })
  active: number;
}

class AgentNextAppointmentDto {
  @ApiProperty({ description: 'Consultation ID', nullable: true })
  id: string | null;

  @ApiProperty({ description: 'Consultation subject', nullable: true })
  subject: string | null;

  @ApiProperty({ description: 'Consultation date', nullable: true })
  consultationDate: Date | null;

  @ApiProperty({ description: 'Customer name', nullable: true })
  customerName: string | null;

  @ApiProperty({ description: 'Consultation status', nullable: true })
  status: string | null;
}

export class AgentDashboardStatsDto {
  @ApiProperty({ type: AgentConsultationStatsDto })
  consultations: AgentConsultationStatsDto;

  @ApiProperty({ type: AgentBookingStatsDto })
  bookings: AgentBookingStatsDto;

  @ApiProperty({ type: AgentPackageStatsDto })
  packages: AgentPackageStatsDto;

  @ApiProperty({ type: AgentNextAppointmentDto })
  nextAppointment: AgentNextAppointmentDto;
}
