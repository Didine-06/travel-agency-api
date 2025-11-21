import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { CommonModule } from './common/common.module';
import { PackagesModule } from './modules/packages/packages.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    CommonModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    DestinationsModule,
    PackagesModule,
    CustomersModule,
    BookingsModule,
    PaymentsModule,
    DashboardModule,
    NotificationsModule,
    UploadsModule,
  ],
})
export class AppModule {}
