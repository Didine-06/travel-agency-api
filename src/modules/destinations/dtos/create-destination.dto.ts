import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Paris Tours', description: 'Nom de la destinations' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'France', description: 'Pays de la destination' })
  @IsString()
  @MinLength(2)
  country: string;

  @ApiPropertyOptional({ example: 'Paris', description: 'Ville de la destination' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Un magnifique pays avec une riche histoire et culture',
    description: 'Description de la destination',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'URL de l\'image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
