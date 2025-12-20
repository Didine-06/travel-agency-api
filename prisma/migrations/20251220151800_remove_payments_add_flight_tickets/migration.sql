/*
  Warnings:

  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('RESERVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SeatClass" AS ENUM ('ECONOMY', 'BUSINESS', 'FIRST');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "flight_tickets" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "departure_datetime" TIMESTAMP(3) NOT NULL,
    "arrival_datetime" TIMESTAMP(3) NOT NULL,
    "seat_class" "SeatClass" NOT NULL,
    "ticket_price" DECIMAL(10,2) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'RESERVED',
    "issued_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "flight_tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flight_tickets" ADD CONSTRAINT "flight_tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_tickets" ADD CONSTRAINT "flight_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
