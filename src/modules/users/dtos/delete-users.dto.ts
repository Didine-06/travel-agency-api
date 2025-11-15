import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteUsersDto {
  @ApiProperty({ 
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'Liste des IDs utilisateurs à supprimer',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
