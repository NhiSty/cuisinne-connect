const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();


async function main() {
	const passwordHash = await argon2.hash('test');
	await prisma.user.create({
		data: {
			email: 'test@test.fr'
			, passwordHash,
			username: 'test'
		}
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





