import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeatClass, TicketStatus } from '@prisma/client';
import { IsEnum, IsDateString, IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFlightTicketDto {
  @ApiPropertyOptional({ example: '2024-07-15T10:00:00.000Z', description: 'Departure date and time' })
  @IsDateString()
  @IsOptional()
  departureDateTime?: Date;

  @ApiPropertyOptional({ example: '2024-07-22T10:00:00.000Z', description: 'Return date (for round trip)' })
  @IsDateString()
  @IsOptional()
  returnDate?: Date;

  @ApiPropertyOptional({ example: false, description: 'Is round trip ticket' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isRoundTrip?: boolean;

  @ApiPropertyOptional({ example: 'Air France', description: 'Airline company' })
  @IsString()
  @IsOptional()
  airline?: string;

  @ApiPropertyOptional({ enum: SeatClass, example: SeatClass.ECONOMY, description: 'Seat class' })
  @IsEnum(SeatClass)
  @IsOptional()
  seatClass?: SeatClass;

  @ApiPropertyOptional({ example: 500.00, description: 'Ticket price' })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsOptional()
  ticketPrice?: number;

  @ApiPropertyOptional({ enum: TicketStatus, example: TicketStatus.RESERVED, description: 'Ticket status' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Flight ticket attachment' })
  attachment?: any;
}
