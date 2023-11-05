const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validator = require('validator');
const argon2 = require('argon2');

const prisma = new PrismaClient();

const router = express.Router();

router.post('/', async (req, res) => {
	try {

		const { email, password, username } = req.body;

		if (!email || !password || !username) {
			return res.sendStatus(422);
		}

		if (!validator.isEmail(email)) {
			return res.sendStatus(422);
		}
		

		const userAlreadyExist = await prisma.user.findUnique({ where: { email } });

		if (userAlreadyExist) {
			return res.sendStatus(409);
		}

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash: await argon2.hash(password),
				username
			}
		});

		if (user) {
			return res.status(200).json({
				user
			});
		}

		return res.sendStatus(500);


	} catch (error) {
		return res.sendStatus(500);
	}

});


module.exports = router;