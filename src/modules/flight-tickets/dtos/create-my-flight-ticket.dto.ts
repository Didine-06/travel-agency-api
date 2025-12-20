import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { SeatClass } from '@prisma/client';

export class CreateMyFlightTicketDto {
  @ApiProperty({ example: 'uuid-booking-id', description: 'ID de la réservation' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

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
}
