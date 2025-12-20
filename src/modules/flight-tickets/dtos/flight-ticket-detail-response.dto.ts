import { ApiProperty } from '@nestjs/swagger';
import { FlightTicketResponseDto } from './flight-ticket-response.dto';

export class FlightTicketDetailResponseDto extends FlightTicketResponseDto {
  @ApiProperty()
  booking?: {
    id: string;
    packageId: string;
    travelDate: Date;
    status: string;
  };

  @ApiProperty()
  customer?: {
    id: string;
    userId: string;
    phone?: string;
    user?: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
}
