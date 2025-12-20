import { ApiProperty } from '@nestjs/swagger';
import { FlightTicketResponseDto } from './flight-ticket-response.dto';

export class FlightTicketListResponseDto {
  @ApiProperty({ type: [FlightTicketResponseDto] })
  data: FlightTicketResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
