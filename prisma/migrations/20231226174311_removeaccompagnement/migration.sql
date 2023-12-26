/*
  Warnings:

  - You are about to drop the `Accompaniment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Accompaniment" DROP CONSTRAINT "Accompaniment_recipeId_fkey";

-- DropTable
DROP TABLE "Accompaniment";
