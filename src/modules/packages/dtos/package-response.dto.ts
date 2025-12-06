import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Destination } from '@prisma/client';
import { DestinationResponseDto } from 'src/modules/destinations/dtos';

export class PackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  destinationId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  includedServices?: any;

  @ApiPropertyOptional()
  imagesUrls?: any;

  @ApiProperty()
  availableFrom: Date;

  @ApiProperty()
  availableTo: Date;

  @ApiProperty()
  maxCapacity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  destination: DestinationResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
