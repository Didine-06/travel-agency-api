import { ApiProperty } from '@nestjs/swagger';

export class DestinationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
