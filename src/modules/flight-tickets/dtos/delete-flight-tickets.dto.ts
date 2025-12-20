import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize } from 'class-validator';

export class DeleteFlightTicketsDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @ArrayMinSize(1)
  ids: string[];
}
