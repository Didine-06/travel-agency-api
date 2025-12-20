import { ApiProperty } from '@nestjs/swagger';
import { ConsultationResponseDto } from './consultation-response.dto';

export class ConsultationListResponseDto {
  @ApiProperty({ type: [ConsultationResponseDto] })
  data: ConsultationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
