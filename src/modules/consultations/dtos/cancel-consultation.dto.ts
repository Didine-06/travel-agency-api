import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CancelConsultationDto {
  @ApiProperty({ example: 'Client a changé ses plans' })
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
