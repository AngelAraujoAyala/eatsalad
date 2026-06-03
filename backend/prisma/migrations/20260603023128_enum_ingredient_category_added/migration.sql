-- CreateEnum
CREATE TYPE "IngredientCategory" AS ENUM ('PROTEINA', 'BARRA', 'COMPLEMENTO', 'ADEREZO');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "category" "IngredientCategory";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maxBarra" INTEGER DEFAULT 0,
ADD COLUMN     "maxComplements" INTEGER DEFAULT 0,
ADD COLUMN     "maxDressings" INTEGER DEFAULT 0;
