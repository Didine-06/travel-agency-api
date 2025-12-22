import { ApiProperty } from '@nestjs/swagger';

class BookingStatsDto {
  @ApiProperty({ description: 'Total number of bookings' })
  total: number;

  @ApiProperty({ description: 'Number of pending bookings' })
  pending: number;

  @ApiProperty({ description: 'Number of confirmed bookings' })
  confirmed: number;

  @ApiProperty({ description: 'Number of completed bookings' })
  completed: number;

  @ApiProperty({ description: 'Number of cancelled bookings' })
  cancelled: number;
}

class ConsultationStatsDto {
  @ApiProperty({ description: 'Total number of consultations' })
  total: number;

  @ApiProperty({ description: 'Number of pending consultations' })
  pending: number;

  @ApiProperty({ description: 'Number of confirmed consultations' })
  confirmed: number;

  @ApiProperty({ description: 'Number of completed consultations' })
  completed: number;

  @ApiProperty({ description: 'Number of cancelled consultations' })
  cancelled: number;
}

class TicketStatsDto {
  @ApiProperty({ description: 'Total number of flight tickets' })
  total: number;

  @ApiProperty({ description: 'Number of reserved tickets' })
  reserved: number;

  @ApiProperty({ description: 'Number of paid tickets' })
  paid: number;

  @ApiProperty({ description: 'Number of cancelled tickets' })
  cancelled: number;

  @ApiProperty({ description: 'Percentage of paid tickets', example: 65.5 })
  paidPercentage: number;

  @ApiProperty({ description: 'Percentage of unpaid tickets', example: 34.5 })
  unpaidPercentage: number;
}

class NextAppointmentDto {
  @ApiProperty({ description: 'Consultation ID', nullable: true })
  id: string | null;

  @ApiProperty({ description: 'Consultation subject', nullable: true })
  subject: string | null;

  @ApiProperty({ description: 'Consultation date', nullable: true })
  consultationDate: Date | null;

  @ApiProperty({ description: 'Agent name', nullable: true })
  agentName: string | null;

  @ApiProperty({ description: 'Consultation status', nullable: true })
  status: string | null;
}

export class ClientDashboardStatsDto {
  @ApiProperty({ type: BookingStatsDto })
  bookings: BookingStatsDto;

  @ApiProperty({ type: ConsultationStatsDto })
  consultations: ConsultationStatsDto;

  @ApiProperty({ type: TicketStatsDto })
  tickets: TicketStatsDto;

  @ApiProperty({ type: NextAppointmentDto })
  nextAppointment: NextAppointmentDto;
}
