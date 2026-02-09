import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApiResponse } from '../../common/helpers';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getClientStats(userId: string) {
    // Get customer
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      return ApiResponse(null);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get all stats in parallel
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalConsultations,
      pendingConsultations,
      confirmedConsultations,
      completedConsultations,
      cancelledConsultations,
      totalTickets,
      reservedTickets,
      paidTickets,
      cancelledTickets,
      nextAppointment,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { customerId: customer.id } }),
      this.prisma.booking.count({ 
        where: { customerId: customer.id, status: 'PENDING' } 
      }),
      this.prisma.booking.count({ 
        where: { customerId: customer.id, status: 'CONFIRMED' } 
      }),
      this.prisma.booking.count({ 
        where: { customerId: customer.id, status: 'COMPLETED' } 
      }),
      this.prisma.booking.count({ 
        where: { customerId: customer.id, status: 'CANCELLED' } 
      }),
      this.prisma.consultation.count({ 
        where: { customerId: customer.id } 
      }),
      this.prisma.consultation.count({ 
        where: { customerId: customer.id, status: 'PENDING' } 
      }),
      this.prisma.consultation.count({ 
        where: { customerId: customer.id, status: 'CONFIRMED' } 
      }),
      this.prisma.consultation.count({ 
        where: { customerId: customer.id, status: 'COMPLETED' } 
      }),
      this.prisma.consultation.count({ 
        where: { customerId: customer.id, status: 'CANCELLED' } 
      }),
      this.prisma.flightTicket.count({ 
        where: { customerId: customer.id } 
      }),
      this.prisma.flightTicket.count({ 
        where: { customerId: customer.id, status: 'RESERVED' } 
      }),
      this.prisma.flightTicket.count({ 
        where: { customerId: customer.id, status: 'PAID' } 
      }),
      this.prisma.flightTicket.count({ 
        where: { customerId: customer.id, status: 'CANCELLED' } 
      }),
      this.prisma.consultation.findFirst({
        where: {
          customerId: customer.id,
          consultationDate: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        orderBy: { consultationDate: 'asc' },
        include: {
          agent: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Calculate percentages for tickets
    const paidPercentage = totalTickets > 0 
      ? Math.round((paidTickets / totalTickets) * 100 * 10) / 10 
      : 0;
    const unpaidPercentage = totalTickets > 0 
      ? Math.round(((reservedTickets + cancelledTickets) / totalTickets) * 100 * 10) / 10 
      : 0;

    const stats = {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      consultations: {
        total: totalConsultations,
        pending: pendingConsultations,
        confirmed: confirmedConsultations,
        completed: completedConsultations,
        cancelled: cancelledConsultations,
      },
      tickets: {
        total: totalTickets,
        reserved: reservedTickets,
        paid: paidTickets,
        cancelled: cancelledTickets,
        paidPercentage,
        unpaidPercentage,
      },
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            subject: nextAppointment.subject,
            consultationDate: nextAppointment.consultationDate,
            agentName: nextAppointment.agent
              ? `${nextAppointment.agent.user.firstName || ''} ${nextAppointment.agent.user.lastName || ''}`.trim()
              : null,
            status: nextAppointment.status,
          }
        : {
            id: null,
            subject: null,
            consultationDate: null,
            agentName: null,
            status: null,
          },
    };

    return ApiResponse(stats);
  }

  async getClientCharts(userId: string) {
    // Get customer
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      return ApiResponse(null);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get bookings by status
    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { customerId: customer.id },
      _count: { id: true },
    });

    // Get tickets payment status
    const [paidTicketsCount, unpaidTicketsCount] = await Promise.all([
      this.prisma.flightTicket.count({
        where: { customerId: customer.id, status: 'PAID' },
      }),
      this.prisma.flightTicket.count({
        where: { customerId: customer.id, status: { in: ['RESERVED', 'CANCELLED'] } },
      }),
    ]);

    // Get spending over time (bookings + paid tickets)
    const [bookingsSpending, ticketsSpending] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['bookingDate'],
        where: {
          customerId: customer.id,
          bookingDate: { gte: sixMonthsAgo },
        },
        _sum: { totalPrice: true },
      }),
      this.prisma.flightTicket.groupBy({
        by: ['createdAt'],
        where: {
          customerId: customer.id,
          status: 'PAID',
          createdAt: { gte: sixMonthsAgo },
        },
        _sum: { ticketPrice: true },
      }),
    ]);

    // Calculate total bookings for percentages
    const totalBookings = bookingsByStatus.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    // Format bookings by status with percentages
    const formattedBookingsByStatus = bookingsByStatus.map(item => ({
      status: item.status,
      count: item._count.id,
      percentage: totalBookings > 0 
        ? Math.round((item._count.id / totalBookings) * 100 * 10) / 10 
        : 0,
    }));

    // Calculate payment status percentages
    const totalTickets = paidTicketsCount + unpaidTicketsCount;
    const paidPercentage = totalTickets > 0 
      ? Math.round((paidTicketsCount / totalTickets) * 100 * 10) / 10 
      : 0;
    const unpaidPercentage = totalTickets > 0 
      ? Math.round((unpaidTicketsCount / totalTickets) * 100 * 10) / 10 
      : 0;

    const ticketsPaymentStatus = [
      {
        status: 'PAID',
        count: paidTicketsCount,
        percentage: paidPercentage,
      },
      {
        status: 'UNPAID',
        count: unpaidTicketsCount,
        percentage: unpaidPercentage,
      },
    ];

    // Combine bookings and tickets spending
    const combinedSpending = this.combineSpendingData(
      bookingsSpending.map(item => ({
        date: item.bookingDate,
        amount: item._sum.totalPrice?.toNumber() || 0,
      })),
      ticketsSpending.map(item => ({
        date: item.createdAt,
        amount: item._sum.ticketPrice?.toNumber() || 0,
      }))
    );

    const charts = {
      spendingOverTime: combinedSpending,
      ticketsPaymentStatus: ticketsPaymentStatus,
      bookingsByStatus: formattedBookingsByStatus,
    };

    return ApiResponse(charts);
  }

  private combineSpendingData(
    bookings: { date: Date; amount: number }[],
    tickets: { date: Date; amount: number }[]
  ) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlySpending = new Map<string, number>();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlySpending.set(monthKey, 0);
    }

    // Add bookings spending
    bookings.forEach(item => {
      const monthKey = `${months[item.date.getMonth()]} ${item.date.getFullYear()}`;
      monthlySpending.set(monthKey, (monthlySpending.get(monthKey) || 0) + item.amount);
    });

    // Add tickets spending
    tickets.forEach(item => {
      const monthKey = `${months[item.date.getMonth()]} ${item.date.getFullYear()}`;
      monthlySpending.set(monthKey, (monthlySpending.get(monthKey) || 0) + item.amount);
    });

    return Array.from(monthlySpending.entries()).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    }));
  }

  async getAgentStats(userId: string) {
    // Get agent
    const agent = await this.prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      // Return empty stats instead of null so frontend can still render
      const emptyStats = {
        consultations: { total: 0, pending: 0, assignedToMe: 0, completed: 0 },
        bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
        packages: { total: 0, active: 0 },
        nextAppointment: {
          id: null,
          subject: null,
          consultationDate: null,
          customerName: null,
          status: null,
        },
      };
      return ApiResponse(emptyStats);
    }

    // Get all stats in parallel
    const [
      totalMyConsultations,
      pendingConsultations,
      assignedToMeConsultations,
      completedConsultations,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalPackages,
      activePackages,
      nextAppointment,
    ] = await Promise.all([
      this.prisma.consultation.count({
        where: { agentId: agent.id },
      }),
      this.prisma.consultation.count({
        where: { status: 'PENDING', agentId: null },
      }),
      this.prisma.consultation.count({
        where: { agentId: agent.id, status: 'CONFIRMED' },
      }),
      this.prisma.consultation.count({
        where: { agentId: agent.id, status: 'COMPLETED' },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.prisma.package.count(),
      this.prisma.package.count({ where: { isActive: true } }),
      this.prisma.consultation.findFirst({
        where: {
          agentId: agent.id,
          consultationDate: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        orderBy: { consultationDate: 'asc' },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const stats = {
      consultations: {
        total: totalMyConsultations,
        pending: pendingConsultations,
        assignedToMe: assignedToMeConsultations,
        completed: completedConsultations,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      packages: {
        total: totalPackages,
        active: activePackages,
      },
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            subject: nextAppointment.subject,
            consultationDate: nextAppointment.consultationDate,
            customerName: nextAppointment.customer
              ? `${nextAppointment.customer.user.firstName || ''} ${nextAppointment.customer.user.lastName || ''}`.trim()
              : null,
            status: nextAppointment.status,
          }
        : {
            id: null,
            subject: null,
            consultationDate: null,
            customerName: null,
            status: null,
          },
    };

    return ApiResponse(stats);
  }

  async getAgentCharts(userId: string) {
    // Get agent
    const agent = await this.prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      // Return empty charts instead of null so frontend can still render
      const emptyCharts = {
        consultationsByStatus: [],
        bookingsByStatus: [],
        consultationsOverTime: [],
      };
      return ApiResponse(emptyCharts);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get consultation stats in parallel
    const [consultationsByStatus, bookingsByStatus, consultationsRaw] =
      await Promise.all([
        this.prisma.consultation.groupBy({
          by: ['status'],
          where: { agentId: agent.id },
          _count: { id: true },
        }),
        this.prisma.booking.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.consultation.findMany({
          where: {
            agentId: agent.id,
            createdAt: { gte: sixMonthsAgo },
          },
          select: { createdAt: true },
        }),
      ]);

    // Format consultations by status
    const totalConsultations = consultationsByStatus.reduce(
      (sum, item) => sum + item._count.id,
      0,
    );
    const formattedConsultationsByStatus = consultationsByStatus.map(
      (item) => ({
        status: item.status,
        count: item._count.id,
        percentage:
          totalConsultations > 0
            ? Math.round((item._count.id / totalConsultations) * 100 * 10) / 10
            : 0,
      }),
    );

    // Format bookings by status
    const totalBookings = bookingsByStatus.reduce(
      (sum, item) => sum + item._count.id,
      0,
    );
    const formattedBookingsByStatus = bookingsByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage:
        totalBookings > 0
          ? Math.round((item._count.id / totalBookings) * 100 * 10) / 10
          : 0,
    }));

    // Format consultations over time
    const consultationsOverTime = this.groupByMonth(
      consultationsRaw.map((c) => c.createdAt),
    );

    const charts = {
      consultationsByStatus: formattedConsultationsByStatus,
      bookingsByStatus: formattedBookingsByStatus,
      consultationsOverTime,
    };

    return ApiResponse(charts);
  }

  private groupByMonth(dates: Date[]) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthlyCounts = new Map<string, number>();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyCounts.set(monthKey, 0);
    }

    // Count dates by month
    dates.forEach((date) => {
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyCounts.has(monthKey)) {
        monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
      }
    });

    return Array.from(monthlyCounts.entries()).map(([month, count]) => ({
      month,
      count,
    }));
  }

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
      totalConsultations,
      pendingConsultations,
      confirmedConsultations,
      completedConsultations,
      totalAgents,
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
      this.prisma.consultation.count(),
      this.prisma.consultation.count({ where: { status: 'PENDING' } }),
      this.prisma.consultation.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.consultation.count({ where: { status: 'COMPLETED' } }),
      this.prisma.agent.count(),
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
      consultations: {
        total: totalConsultations,
        pending: pendingConsultations,
        confirmed: confirmedConsultations,
        completed: completedConsultations,
      },
      agents: {
        total: totalAgents,
      },
      revenue: {
        total: totalRevenue._sum.ticketPrice || 0,
      },
    };

    return ApiResponse(stats);
  }
}
