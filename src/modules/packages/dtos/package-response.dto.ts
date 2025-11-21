import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty()
  availableFrom: Date;

  @ApiProperty()
  availableTo: Date;

  @ApiProperty()
  maxCapacity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
