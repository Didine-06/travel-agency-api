import { ApiProperty } from '@nestjs/swagger';

class ConsultationsByStatusChart {
  @ApiProperty({ description: 'Consultation status', example: 'CONFIRMED' })
  status: string;

  @ApiProperty({ description: 'Number of consultations', example: 10 })
  count: number;

  @ApiProperty({ description: 'Percentage', example: 45.5 })
  percentage: number;
}

class BookingsByStatusChart {
  @ApiProperty({ description: 'Booking status', example: 'CONFIRMED' })
  status: string;

  @ApiProperty({ description: 'Number of bookings', example: 10 })
  count: number;

  @ApiProperty({ description: 'Percentage', example: 45.5 })
  percentage: number;
}

class ConsultationsOverTimeChart {
  @ApiProperty({ description: 'Month name', example: 'January 2026' })
  month: string;

  @ApiProperty({ description: 'Number of consultations', example: 5 })
  count: number;
}

export class AgentDashboardChartsDto {
  @ApiProperty({
    type: [ConsultationsByStatusChart],
    description: 'Distribution of agent consultations by status',
  })
  consultationsByStatus: ConsultationsByStatusChart[];

  @ApiProperty({
    type: [BookingsByStatusChart],
    description: 'Distribution of all bookings by status',
  })
  bookingsByStatus: BookingsByStatusChart[];

  @ApiProperty({
    type: [ConsultationsOverTimeChart],
    description: 'Agent consultations over the last 6 months',
  })
  consultationsOverTime: ConsultationsOverTimeChart[];
}
