import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ example: 'France', description: 'Pays de la destination' })
  @IsString()
  @MinLength(2)
  country: string;

  @ApiProperty({
    example: 'Un magnifique pays avec une riche histoire et culture',
    description: 'Description de la destination',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
