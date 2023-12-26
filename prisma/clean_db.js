import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.userRecipePreference.deleteMany();
  await prisma.recipeTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.accompaniment.deleteMany();
  await prisma.favoriteRecipe.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipeInstructions.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  console.log("Toutes les données ont été supprimées.");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
