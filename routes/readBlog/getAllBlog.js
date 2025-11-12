const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
    try {
        const data = await prisma.all_blogs.findMany();
        res.send(data)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})


module.exports = router