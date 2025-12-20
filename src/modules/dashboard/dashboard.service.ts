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
      totalFlightTickets,
      paidTickets,
      reservedTickets,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.customer.count(),
      this.prisma.destination.count(),
      this.prisma.package.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.flightTicket.count(),
      this.prisma.flightTicket.count({ where: { status: 'PAID' } }),
      this.prisma.flightTicket.count({ where: { status: 'RESERVED' } }),
      this.prisma.flightTicket.aggregate({
        where: { status: 'PAID' },
        _sum: {
          ticketPrice: true,
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
      flightTickets: {
        total: totalFlightTickets,
        paid: paidTickets,
        reserved: reservedTickets,
      },
      revenue: {
        total: totalRevenue._sum.ticketPrice || 0,
      },
    };

    return ApiResponse(stats);
  }
}
