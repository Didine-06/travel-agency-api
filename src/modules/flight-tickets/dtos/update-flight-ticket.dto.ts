import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeatClass, TicketStatus } from '@prisma/client';
import { IsEnum, IsDateString, IsOptional } from 'class-validator';

export class UpdateFlightTicketDto {
  @ApiPropertyOptional({ example: '2024-07-15T10:00:00.000Z', description: 'Date et heure de départ' })
  @IsDateString()
  @IsOptional()
  departureDateTime?: Date;

  @ApiPropertyOptional({ example: '2024-07-15T18:00:00.000Z', description: 'Date et heure d\'arrivée' })
  @IsDateString()
  @IsOptional()
  arrivalDateTime?: Date;

  @ApiPropertyOptional({ enum: SeatClass, example: SeatClass.ECONOMY, description: 'Classe de siège' })
  @IsEnum(SeatClass)
  @IsOptional()
  seatClass?: SeatClass;

  @ApiPropertyOptional({ example: 500.00, description: 'Prix du billet' })
  @IsOptional()
  ticketPrice?: number;

  @ApiPropertyOptional({ enum: TicketStatus, example: TicketStatus.RESERVED, description: 'Statut du billet' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
