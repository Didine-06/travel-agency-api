import { ApiProperty } from '@nestjs/swagger';

export class DeletePackagesDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  ids: string[];
}
