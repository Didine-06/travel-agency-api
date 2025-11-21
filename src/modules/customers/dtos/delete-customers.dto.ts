import { ApiProperty } from '@nestjs/swagger';

export class DeleteCustomersDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  ids: string[];
}
