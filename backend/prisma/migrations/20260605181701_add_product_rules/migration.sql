/*
  Warnings:

  - You are about to drop the column `maxAderezos` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxBarra` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxComplements` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxIngredients` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxProteins` on the `Product` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IngredientCategory" ADD VALUE 'TORTILLA';
ALTER TYPE "IngredientCategory" ADD VALUE 'PAN';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "maxAderezos",
DROP COLUMN "maxBarra",
DROP COLUMN "maxComplements",
DROP COLUMN "maxIngredients",
DROP COLUMN "maxProteins";

-- CreateTable
CREATE TABLE "ProductRule" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "category" "IngredientCategory" NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductRule_productId_category_key" ON "ProductRule"("productId", "category");

-- AddForeignKey
ALTER TABLE "ProductRule" ADD CONSTRAINT "ProductRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
