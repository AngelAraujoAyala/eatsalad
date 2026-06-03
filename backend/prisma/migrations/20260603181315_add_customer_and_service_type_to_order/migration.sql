/*
  Warnings:

  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('COMEDOR', 'RECOGER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "pickupTime" TEXT,
ADD COLUMN     "serviceType" "ServiceType" NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);
