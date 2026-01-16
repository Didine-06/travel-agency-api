/*
  Warnings:

  - You are about to drop the column `booking_id` on the `flight_tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "flight_tickets" DROP CONSTRAINT "flight_tickets_booking_id_fkey";

-- AlterTable
ALTER TABLE "flight_tickets" DROP COLUMN "booking_id",
ADD COLUMN     "attachment_path" TEXT;
