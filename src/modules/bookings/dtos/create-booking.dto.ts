import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-customer-id' })
  customerId: string;

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

  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.PENDING })
  status?: BookingStatus;
}
