import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty()
  arrivalDateTime: Date;

  @ApiProperty({ enum: SeatClass })
  seatClass: SeatClass;

  @ApiProperty()
  ticketPrice: number;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty({ required: false })
  issuedAt?: Date;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  updatedBy?: string;
}
