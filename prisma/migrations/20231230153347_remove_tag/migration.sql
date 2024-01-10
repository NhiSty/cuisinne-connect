/*
  Warnings:

  - You are about to drop the `RecipeTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShoppingList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeTag" DROP CONSTRAINT "RecipeTag_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeTag" DROP CONSTRAINT "RecipeTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_userId_fkey";

-- DropTable
DROP TABLE "RecipeTag";

-- DropTable
DROP TABLE "ShoppingList";

-- DropTable
DROP TABLE "Tag";
