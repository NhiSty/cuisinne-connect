const express = require('express')
const dotenv = require('dotenv');
const {PrismaClient} = require("@prisma/client");
dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = parseInt(req.query.pageSize,10) || 10;
    const offset = (page - 1) * pageSize;

    try {
        const recipes = await prisma.recipe.findMany({
            skip: offset,
            take: pageSize,
        });

        const itemsAvailable = await prisma.recipe.count();

        res.json({
            items: recipes,
            itemsAvailable,
            itemsOffset: offset,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id,10);
    try {
        const recipe = await prisma.recipe.findUnique({
            where: {
                id,
            },
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/rating', async (req, res) => {
    const id = parseInt(req.params.id,10);
    try {
        const ratings = await prisma.rating.findMany({
            where: {
                recipeId: id,
            },
        });

        const ratingAverage = ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;

        res.json(ratingAverage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/ingredient', async (req, res) => {
    const id = parseInt(req.params.id,10);
    try {
       const ingredients = await prisma.recipeIngredient.findFirst({
            where: {
                recipeId: id,
            },
           
        });

        if (!ingredients) {
            return res.status(404).json({ error: 'Ingredients not found' });
        }


        res.json(ingredients.ingredients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
