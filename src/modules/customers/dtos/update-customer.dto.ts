import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA' })
  country?: string;

  @ApiPropertyOptional({ example: '1990-01-01T00:00:00.000Z' })
  dateOfBirth?: Date;
}
