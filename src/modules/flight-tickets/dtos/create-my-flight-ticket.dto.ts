import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { SeatClass } from '@prisma/client';

export class CreateMyFlightTicketDto {
  @ApiProperty({ example: '2024-07-15T10:00:00.000Z', description: 'Departure date and time' })
  @IsDateString()
  departureDateTime: Date;

  @ApiPropertyOptional({ example: '2024-07-22T10:00:00.000Z', description: 'Return date (for round trip)' })
  @IsDateString()
  @IsOptional()
  returnDate?: Date;

  @ApiPropertyOptional({ example: false, description: 'Is round trip ticket', default: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isRoundTrip?: boolean;

  @ApiPropertyOptional({ example: 'Air France', description: 'Airline company' })
  @IsString()
  @IsOptional()
  airline?: string;

  @ApiProperty({ enum: SeatClass, example: SeatClass.ECONOMY, description: 'Seat class' })
  @IsEnum(SeatClass)
  seatClass: SeatClass;

  @ApiProperty({ example: 500.00, description: 'Ticket price' })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNotEmpty()
  ticketPrice: number;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Flight ticket attachment' })
  attachment?: any;
}
