import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './repository/notifications.repository';
import { CreateNotificationDto } from './dtos';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import { NotificationErrors } from './enums';
import { UsersRepository } from '../users/repository/users.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    // Vérifier si le user existe
    const user = await this.usersRepository.findById(
      createNotificationDto.userId,
    );
    if (!user) {
      return ErrorResponse(NotificationErrors.USER_NOT_FOUND);
    }

    const notification = await this.notificationsRepository.create(
      createNotificationDto,
    );
    return ApiResponse(notification);
  }

  async findAllByUserId(userId: string) {
    const notifications = await this.notificationsRepository.findAllByUserId(
      userId,
    );
    return ApiResponse(notifications);
  }

  async markAsRead(id: string) {
    const notification = await this.notificationsRepository.markAsRead(id);
    return ApiResponse(notification);
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationsRepository.markAllAsRead(userId);
    return ApiResponse(result);
  }

  async delete(id: string) {
    const notification = await this.notificationsRepository.delete(id);
    return ApiResponse(notification);
  }
}
