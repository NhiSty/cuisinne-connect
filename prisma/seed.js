const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client')


const prisma = new PrismaClient();


async function main() {
    
}
main()
    .catch((e) => {

        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })





