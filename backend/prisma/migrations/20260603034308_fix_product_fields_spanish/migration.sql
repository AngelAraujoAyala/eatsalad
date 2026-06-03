/*
  Warnings:

  - You are about to drop the column `maxDressings` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "maxDressings",
ADD COLUMN     "maxAderezos" INTEGER DEFAULT 0;
