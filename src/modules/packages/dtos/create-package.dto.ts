import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'uuid-destination-id' })
  destinationId: string;

  @ApiProperty({ example: 'Summer Beach Package' })
  title: string;

  @ApiPropertyOptional({ example: 'Enjoy a relaxing beach vacation' })
  description?: string;

  @ApiProperty({ example: 7 })
  duration: number;

  @ApiProperty({ example: 1500.00 })
  price: number;

  @ApiPropertyOptional({ example: ['Hotel', 'Meals', 'Tours'] })
  includedServices?: string[];

  @ApiProperty({ example: '2024-06-01T00:00:00.000Z' })
  availableFrom: Date;

  @ApiProperty({ example: '2024-09-30T00:00:00.000Z' })
  availableTo: Date;

  @ApiProperty({ example: 50 })
  maxCapacity: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
