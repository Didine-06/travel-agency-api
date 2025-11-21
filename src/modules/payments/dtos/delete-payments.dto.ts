import { ApiProperty } from '@nestjs/swagger';

export class DeletePaymentsDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  ids: string[];
}
