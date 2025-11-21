import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repository/notifications.repository';
import { UsersRepository } from '../users/repository/users.repository';

@Module({
  providers: [NotificationsService, NotificationsRepository, UsersRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
