import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Création d'une recette
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Gâteau choco-banane',
      cookingTime: 45,
      instructions: {
        createMany: {
          data: [
            'Préchauffez votre four à 180°C (350°F) et graissez un moule à gâteau de 20 cm (8 pouces).',
            "Dans un bol, écrasez les bananes mûres avec une fourchette jusqu'à obtenir une purée lisse.",
            "Ajoutez le cacao en poudre et l'extrait de vanille à la purée de banane. Mélangez bien pour incorporer le cacao.",
            'Dans un autre bol, mélangez la farine, le bicarbonate de soude et le sel.',
            "Dans un troisième bol, battez les œufs, le sucre et l'huile jusqu'à obtenir un mélange homogène.",
          ].map((instructions) => ({ instructions })),
        },
      },
      servings: 8,
      description: 'Un gâteau moelleux et délicieux, parfait pour le goûter !',
    },
  });

  // Ajout des ingrédients de la recette
  // Ajout des ingrédients de la recette
await prisma.recipeIngredient.create({
	data: {
	  recipeId: recipe.id,
	  ingredients: {
		create: [
		  { name: 'banane', quantity: 2, unit: 'unité' },
		  { name: 'cacao en poudre', quantity: 2, unit: 'cuillère à soupe' },
		  { name: 'farine', quantity: 150, unit: 'gramme' },
		  { name: 'bicarbonate de soude', quantity: 1, unit: 'cuillère à café' },
		  { name: 'sel', quantity: 1, unit: 'pincée' },
		  { name: 'œuf', quantity: 2, unit: 'unité' },
		  { name: 'sucre', quantity: 100, unit: 'gramme' },
		  { name: 'huile', quantity: 100, unit: 'gramme' },
		  { name: 'extrait de vanille', quantity: 1, unit: 'cuillère à café' },
		  { name: 'sucre glace', quantity: 2, unit: 'cuillère à soupe' },
		  { name: 'lait', quantity: 1, unit: 'cuillère à soupe' },
		  { name: 'pépites de chocolat', quantity: 50, unit: 'gramme' },
		  { name: 'noix', quantity: 50, unit: 'gramme' },
		  { name: 'noix de coco râpée', quantity: 50, unit: 'gramme' },
		  { name: 'amande effilée', quantity: 50, unit: 'gramme' },
		  { name: 'noisette', quantity: 50, unit: 'gramme' },
		  { name: 'pistache', quantity: 50, unit: 'gramme' },
		  { name: 'poudre d\'amande', quantity: 50, unit: 'gramme' },
		],
	  },
	},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Terminé');
    await prisma.$disconnect();
  });
