import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 500.00 })
  amount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CARD })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.DEPOSIT })
  paymentType?: PaymentType;

  @ApiPropertyOptional({ example: 'TRX123456789' })
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Updated payment notes' })
  notes?: string;
}
