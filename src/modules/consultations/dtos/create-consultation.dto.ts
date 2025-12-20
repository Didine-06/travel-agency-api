import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({ example: 'Demande d\'information sur les forfaits' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ example: 'Je souhaite obtenir des informations détaillées sur vos forfaits' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-07-20T10:00:00.000Z', description: 'Date et heure de la consultation' })
  @IsDateString()
  consultationDate: Date;

  @ApiPropertyOptional({ example: 30, default: 30, description: 'Durée en minutes' })
  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number;
}
