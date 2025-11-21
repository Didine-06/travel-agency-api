import { ApiProperty } from '@nestjs/swagger';

export class DeleteBookingsDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  ids: string[];
}
