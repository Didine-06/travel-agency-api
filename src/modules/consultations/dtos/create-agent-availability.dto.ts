import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class CreateAgentAvailabilityDto {
  @ApiProperty({ example: 1, description: 'Jour de la semaine (0=dimanche, 1=lundi, etc.)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Heure de début (format HH:mm)' })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'Heure de fin (format HH:mm)' })
  endTime: string;
}
