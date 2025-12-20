import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatClass, TicketStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsDecimal, IsOptional } from 'class-validator';

export class CreateFlightTicketDto {
  @ApiProperty({ example: 'uuid-booking-id', description: 'ID de la réservation' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 'uuid-customer-id', description: 'ID du client' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2024-07-15T10:00:00.000Z', description: 'Date et heure de départ' })
  @IsDateString()
  departureDateTime: Date;

  @ApiProperty({ example: '2024-07-15T18:00:00.000Z', description: 'Date et heure d\'arrivée' })
  @IsDateString()
  arrivalDateTime: Date;

  @ApiProperty({ enum: SeatClass, example: SeatClass.ECONOMY, description: 'Classe de siège' })
  @IsEnum(SeatClass)
  seatClass: SeatClass;

  @ApiProperty({ example: 500.00, description: 'Prix du billet' })
  @IsNotEmpty()
  ticketPrice: number;

  @ApiPropertyOptional({ enum: TicketStatus, example: TicketStatus.RESERVED, description: 'Statut du billet' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
