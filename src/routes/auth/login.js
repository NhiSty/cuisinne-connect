const { PrismaClient } = require('@prisma/client')
const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const router = express.Router();
const prisma = new PrismaClient();


router.post("/", async (req, res) => {
	try {

		const { email, password } = req.body


		if (!email || !password) {
			return res.send({ status: 401, body: { message: 'Vous devez indiquer un email et un mot de passe !' } });
		}

		if (!validator.isEmail(email)) {
			return res.sendStatus(401)
		}


		const user = await prisma.user.findUnique({where: {email}});

		if (!process.env.JWT_SECRET) {
			return res.sendStatus(500);
		}

		if (!user) {
			return res.sendStatus(401);
		}

		try {
			if (!(await argon2.verify(user.passwordHash, password))) {
				return res.sendStatus(401);
			}
		} catch (error) {
			return res.sendStatus(404);
		}

		const userData = {
			id: user.id,
			email: user.email,
			username: user.username
		}



		const sign = jwt.sign({userData}, process.env.JWT_SECRET);

		return res.send({ userData, token: sign });

	} catch (error) {
		return res.sendStatus(500)
	}

});

module.exports = router;