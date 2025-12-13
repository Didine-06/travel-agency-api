import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  numberOfAdults: number;

  @ApiProperty()
  numberOfChildren: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  travelDate: Date;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  bookingDate: Date;

  @ApiProperty({
    description: 'Package information',
  })
  package: {
    id: string;
    title: string;
    price: number;
    duration: number;
    destination: {
      name: string;
      country: string;
      city: string | null;
    };
  };

  static fromEntity(booking: any): BookingListResponseDto {
    return {
      id: booking.id,
      numberOfAdults: booking.numberOfAdults,
      numberOfChildren: booking.numberOfChildren,
      totalPrice: booking.totalPrice,
      travelDate: booking.travelDate,
      status: booking.status,
      bookingDate: booking.bookingDate,
      package: {
        id: booking.package.id,
        title: booking.package.title,
        price: booking.package.price,
        duration: booking.package.duration,
        destination: {
          name: booking.package.destination.name,
          country: booking.package.destination.country,
          city: booking.package.destination.city,
        },
      },
    };
  }

  static fromEntities(bookings: any[]): BookingListResponseDto[] {
    return bookings.map(booking => this.fromEntity(booking));
  }
}
