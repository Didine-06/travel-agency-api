import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 2 })
  numberOfAdults?: number;

  @ApiPropertyOptional({ example: 1 })
  numberOfChildren?: number;

  @ApiPropertyOptional({ example: 3000.00 })
  totalPrice?: number;

  @ApiPropertyOptional({ example: '2024-07-15T00:00:00.000Z' })
  travelDate?: Date;

  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  status?: BookingStatus;
}
