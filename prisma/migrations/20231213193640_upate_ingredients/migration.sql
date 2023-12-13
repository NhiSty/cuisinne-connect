/*
  Warnings:

  - You are about to drop the column `ingredientId` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the `Ingredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_ingredientId_fkey";

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "ingredientId",
DROP COLUMN "quantity",
DROP COLUMN "unit",
ADD COLUMN     "ingredients" TEXT[];

-- DropTable
DROP TABLE "Ingredient";
