import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatClass, TicketStatus } from '@prisma/client';

export class FlightTicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  departureDateTime: Date;

  @ApiPropertyOptional()
  returnDate?: Date;

  @ApiProperty()
  isRoundTrip: boolean;

  @ApiPropertyOptional()
  airline?: string;

  @ApiProperty({ enum: SeatClass })
  seatClass: SeatClass;

  @ApiProperty()
  ticketPrice: number;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
