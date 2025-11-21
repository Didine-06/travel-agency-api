import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  packageId: string;

  @ApiProperty()
  numberOfAdults: number;

  @ApiProperty()
  numberOfChildren: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  bookingDate: Date;

  @ApiProperty()
  travelDate: Date;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
