import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-booking-id' })
  bookingId: string;

  @ApiProperty({ example: 500.00 })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentType, example: PaymentType.DEPOSIT })
  paymentType: PaymentType;

  @ApiPropertyOptional({ example: 'TRX123456789' })
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Initial deposit payment' })
  notes?: string;
}
