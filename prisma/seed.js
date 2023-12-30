import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
	// Création d'un utilisateur
	const passwordHash = await argon2.hash('test123');
	const user = await prisma.user.create({
		data: {
			username: 'sdev',
			email: 'sdev@test.fr',
			passwordHash,
			diets: {
				create: [{ diet: 'Sans sucre' }]
			},
			allergies: {
				create: [{ allergy: 'Kiwi' }, { allergy: 'Oeuf' }]
			},
			preferences: {
				create: [{ preference: 'Pimenté' }, { preference: 'Sans alcool' }]
			}
		}
	});

	// Création d'une recette
	const recipe = await prisma.recipe.create({
		data: {
			title: 'Poulet rôti aux champignons',
			description:
				"Un délicieux plat de poulet rôti accompagné d'une sauce onctueuse aux champignons.",
			cookingTime: 60,
			servings: 4,
			instructions: {
				createMany: {
					data: [
						{ instructions: 'Préchauffez le four à 200°C.' },
						{ instructions: "Nettoyez et émincez les champignons, l'ail et l'oignon." },
						{ instructions: "Faites chauffer un peu d'huile d'olive dans une poêle et faites revenir l'ail et l'oignon." },
						{ instructions: 'Ajoutez les champignons et laissez-les dorer quelques minutes.' },
						{ instructions: 'Ajoutez le bouillon de poulet et la crème fraîche. Laissez mijoter quelques minutes.' },
						{ instructions: 'Pendant ce temps, assaisonnez le poulet avec du sel, du poivre et des herbes de Provence.' },
						{ instructions: 'Placez le poulet dans un plat allant au four et enfournez-le pendant environ 50 minutes.' },
						{ instructions: 'Servez le poulet rôti accompagné de la sauce aux champignons.' }
					]
				}
			},
			ingredients: {
				createMany: {
					data: [
						{ name: '1 poulet entier' },
						{ name: '500g de champignons de Paris' },
						{ name: "2 gousses d'ail" },
						{ name: '1 oignon' },
						{ name: '200ml de bouillon de poulet' },
						{ name: '2 cuillères à soupe de crème fraîche' },
						{ name: 'Herbes de Provence' },
						{ name: "Huile d'olive" },
						{ name: 'Sel' },
						{ name: 'Poivre' }
					]
				}
			},
			authorId: user.id
		}
	});

	// Création d'un commentaire
	const comment = await prisma.comment.create({
		data: {
			content: 'Super recette !',
			userId: user.id,
			recipeId: recipe.id
		}
	});

	// Création d'une note
	const rating = await prisma.rating.create({
		data: {
			rating: 5,
			commentId: comment.id,
			userId: user.id,
			recipeId: recipe.id
		}
	});

	// Ajout de la recette aux favoris
	const favoriteRecipe = await prisma.favoriteRecipe.create({
		data: {
			userId: user.id,
			recipeId: recipe.id
		}
	});

	console.log('Database seeded');
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
