import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CancelFlightTicketDto {
  @ApiProperty({ example: 'Client a changé ses plans de voyage' })
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
