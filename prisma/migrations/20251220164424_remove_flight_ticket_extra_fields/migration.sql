/*
  Warnings:

  - You are about to drop the column `cancelled_at` on the `flight_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `issued_at` on the `flight_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `flight_tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "flight_tickets" DROP COLUMN "cancelled_at",
DROP COLUMN "issued_at",
DROP COLUMN "updated_by";
