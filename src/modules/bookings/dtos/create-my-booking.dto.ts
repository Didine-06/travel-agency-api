import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class CreateMyBookingDto {
  @ApiProperty({ example: 'uuid-package-id' })
  packageId: string;

  @ApiProperty({ example: 2 })
  numberOfAdults: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  numberOfChildren?: number;

  @ApiProperty({ example: 3000.0 })
  totalPrice: number;

  @ApiProperty({ example: '2024-07-15T00:00:00.000Z' })
  travelDate: Date;
}
