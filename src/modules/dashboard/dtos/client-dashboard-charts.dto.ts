import { ApiProperty } from '@nestjs/swagger';

class SpendingOverTimeChart {
  @ApiProperty({ description: 'Month name', example: 'December' })
  month: string;

  @ApiProperty({ description: 'Total amount spent', example: 2500.50 })
  amount: number;
}

class TicketsPaymentStatusChart {
  @ApiProperty({ description: 'Payment status', example: 'PAID' })
  status: string;

  @ApiProperty({ description: 'Number of tickets', example: 18 })
  count: number;

  @ApiProperty({ description: 'Percentage', example: 72.0 })
  percentage: number;
}

class BookingsByStatusChart {
  @ApiProperty({ description: 'Status name', example: 'CONFIRMED' })
  status: string;

  @ApiProperty({ description: 'Number of bookings', example: 10 })
  count: number;

  @ApiProperty({ description: 'Percentage', example: 45.5 })
  percentage: number;
}

export class ClientDashboardChartsDto {
  @ApiProperty({ 
    type: [SpendingOverTimeChart], 
    description: 'Total spending (bookings + paid tickets) over the last 6 months' 
  })
  spendingOverTime: SpendingOverTimeChart[];

  @ApiProperty({ 
    type: [TicketsPaymentStatusChart], 
    description: 'Distribution of tickets by payment status (Paid vs Unpaid)' 
  })
  ticketsPaymentStatus: TicketsPaymentStatusChart[];

  @ApiProperty({ 
    type: [BookingsByStatusChart], 
    description: 'Distribution of bookings by status' 
  })
  bookingsByStatus: BookingsByStatusChart[];
}
