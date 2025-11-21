import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePackageDto {
  @ApiPropertyOptional({ example: 'uuid-destination-id' })
  destinationId?: string;

  @ApiPropertyOptional({ example: 'Summer Beach Package' })
  title?: string;

  @ApiPropertyOptional({ example: 'Enjoy a relaxing beach vacation' })
  description?: string;

  @ApiPropertyOptional({ example: 7 })
  duration?: number;

  @ApiPropertyOptional({ example: 1500.00 })
  price?: number;

  @ApiPropertyOptional({ example: ['Hotel', 'Meals', 'Tours'] })
  includedServices?: string[];

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00.000Z' })
  availableFrom?: Date;

  @ApiPropertyOptional({ example: '2024-09-30T00:00:00.000Z' })
  availableTo?: Date;

  @ApiPropertyOptional({ example: 50 })
  maxCapacity?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
