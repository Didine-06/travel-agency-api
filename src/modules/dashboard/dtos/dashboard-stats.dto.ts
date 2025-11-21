import { ApiProperty } from '@nestjs/swagger';

class UsersStats {
  @ApiProperty()
  total: number;
}

class CustomersStats {
  @ApiProperty()
  total: number;
}

class DestinationsStats {
  @ApiProperty()
  total: number;
}

class PackagesStats {
  @ApiProperty()
  total: number;
}

class BookingsStats {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  confirmed: number;
}

class RevenueStats {
  @ApiProperty()
  total: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: UsersStats })
  users: UsersStats;

  @ApiProperty({ type: CustomersStats })
  customers: CustomersStats;

  @ApiProperty({ type: DestinationsStats })
  destinations: DestinationsStats;

  @ApiProperty({ type: PackagesStats })
  packages: PackagesStats;

  @ApiProperty({ type: BookingsStats })
  bookings: BookingsStats;

  @ApiProperty({ type: RevenueStats })
  revenue: RevenueStats;
}
