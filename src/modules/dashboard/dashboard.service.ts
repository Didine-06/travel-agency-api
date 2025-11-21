import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApiResponse } from '../../common/helpers';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalCustomers,
      totalDestinations,
      totalPackages,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.customer.count(),
      this.prisma.destination.count(),
      this.prisma.package.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
      },
      customers: {
        total: totalCustomers,
      },
      destinations: {
        total: totalDestinations,
      },
      packages: {
        total: totalPackages,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
    };

    return ApiResponse(stats);
  }
}
