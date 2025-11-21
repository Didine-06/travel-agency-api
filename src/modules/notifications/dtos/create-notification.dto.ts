import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'uuid-user-id' })
  userId: string;

  @ApiProperty({ example: 'booking_confirmed' })
  type: string;

  @ApiProperty({ example: 'Booking Confirmed' })
  title: string;

  @ApiProperty({ example: 'Your booking has been confirmed successfully.' })
  message: string;

  @ApiPropertyOptional({ example: false })
  isRead?: boolean;
}
