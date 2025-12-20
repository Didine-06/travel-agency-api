import { ApiProperty } from '@nestjs/swagger';
import { ConsultationResponseDto } from './consultation-response.dto';

export class ConsultationDetailResponseDto extends ConsultationResponseDto {
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

  @ApiProperty()
  agent?: {
    id: string;
    userId: string;
    phone?: string;
    specialty?: string;
    user?: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
}
