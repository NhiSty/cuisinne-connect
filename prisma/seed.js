const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();


async function main() {
	const passwordHash = await argon2.hash('test');
	const user = await prisma.user.create({
		data: {
			email: 'test@test.fr'
			, passwordHash,
			username: 'test'
		},
		select: {
			id: true,
		},
	});

	await prisma.recipe.create({
		data: {
			title: 'Cake choco-banane',
			image: '/recipe-image/cake-choco-banane.jpg',
			cookingTime: 45,
			instructions: [ 'Préchauffez votre four à 180°C (350°F) et graissez un moule à gâteau de 20 cm (8 pouces).', 'Dans un bol, écrasez les bananes mûres avec une fourchette jusqu\'à obtenir une purée lisse.', 'Ajoutez le cacao en poudre et l\'extrait de vanille à la purée de banane. Mélangez bien pour incorporer le cacao.', 'Dans un autre bol, mélangez la farine, le bicarbonate de soude et le sel.', 'Dans un troisième bol, battez les œufs, le sucre et l\'huile jusqu\'à obtenir un mélange homogène.' ],
			servings: 8,
			authorId: user.id,
			description: 'Un gâteau moelleux et délicieux, parfait pour le goûter !',
		},
	});
}
	main()
		.catch((e) => {
			console.error(e);
			process.exit(1);
		})
		.finally(async () => {
			console.log('Done');
			await prisma.$disconnect();
		});





