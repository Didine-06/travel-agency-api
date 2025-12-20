import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ 
    example: 'Client requested cancellation due to personal reasons',
    description: 'Reason for cancellation (required)'
  })
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
