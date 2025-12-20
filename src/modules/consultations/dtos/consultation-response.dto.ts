import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '@prisma/client';

export class ConsultationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ required: false })
  agentId?: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  consultationDate: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty({ enum: ConsultationStatus })
  status: ConsultationStatus;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
