import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Suppression des données de chaque table
	await prisma.rating.deleteMany();
	await prisma.favoriteRecipe.deleteMany();
	await prisma.comment.deleteMany();
	await prisma.recipeIngredient.deleteMany();
	await prisma.recipeInstructions.deleteMany();
	await prisma.recipe.deleteMany();
	await prisma.userPreference.deleteMany();
	await prisma.userAllergy.deleteMany();
	await prisma.userDiet.deleteMany();
	await prisma.user.deleteMany();

	console.log('Database cleaned');
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
