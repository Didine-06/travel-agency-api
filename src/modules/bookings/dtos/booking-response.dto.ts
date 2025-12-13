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

  static fromEntity(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      customerId: booking.customerId,
      packageId: booking.packageId,
      numberOfAdults: booking.numberOfAdults,
      numberOfChildren: booking.numberOfChildren,
      totalPrice: booking.totalPrice,
      bookingDate: booking.bookingDate,
      travelDate: booking.travelDate,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static fromEntities(bookings: any[]): BookingResponseDto[] {
    return bookings.map(booking => this.fromEntity(booking));
  }
}
