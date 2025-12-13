import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingDetailResponseDto {
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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    description: 'Package information',
  })
  package: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    duration: number;
    includedServices: any;
    imagesUrls: any;
    availableFrom: Date;
    availableTo: Date;
    maxCapacity: number;
    destination: {
      id: string;
      name: string;
      country: string;
      city: string | null;
      description: string | null;
      imageUrl: string | null;
    };
  };

  @ApiProperty({
    description: 'Customer information',
  })
  customer: {
    id: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };

  @ApiProperty({
    description: 'Payments information',
    required: false,
  })
  payments?: any[];

  static fromEntity(booking: any): BookingDetailResponseDto {
    return {
      id: booking.id,
      numberOfAdults: booking.numberOfAdults,
      numberOfChildren: booking.numberOfChildren,
      totalPrice: booking.totalPrice,
      travelDate: booking.travelDate,
      status: booking.status,
      bookingDate: booking.bookingDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      package: {
        id: booking.package.id,
        title: booking.package.title,
        description: booking.package.description,
        price: booking.package.price,
        duration: booking.package.duration,
        includedServices: booking.package.includedServices,
        imagesUrls: booking.package.imagesUrls,
        availableFrom: booking.package.availableFrom,
        availableTo: booking.package.availableTo,
        maxCapacity: booking.package.maxCapacity,
        destination: {
          id: booking.package.destination.id,
          name: booking.package.destination.name,
          country: booking.package.destination.country,
          city: booking.package.destination.city,
          description: booking.package.destination.description,
          imageUrl: booking.package.destination.imageUrl,
        },
      },
      customer: {
        id: booking.customer.id,
        phone: booking.customer.phone,
        address: booking.customer.address,
        city: booking.customer.city,
        country: booking.customer.country,
        user: {
          id: booking.customer.user.id,
          email: booking.customer.user.email,
          firstName: booking.customer.user.firstName,
          lastName: booking.customer.user.lastName,
        },
      },
      payments: booking.payments || [],
    };
  }
}
