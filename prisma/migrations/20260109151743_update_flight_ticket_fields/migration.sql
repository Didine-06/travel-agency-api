/*
  Warnings:

  - You are about to drop the column `arrival_datetime` on the `flight_tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "flight_tickets" DROP COLUMN "arrival_datetime",
ADD COLUMN     "airline" TEXT,
ADD COLUMN     "is_round_trip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "return_date" TIMESTAMP(3);
