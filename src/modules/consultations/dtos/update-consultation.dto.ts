import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateConsultationDto {
  @ApiPropertyOptional({ example: 'Demande d\'information sur les forfaits' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ example: 'Je souhaite obtenir des informations détaillées' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-07-20T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  consultationDate?: Date;

  @ApiPropertyOptional({ example: 60, description: 'Durée en minutes' })
  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number;
}
