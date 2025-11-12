const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 


router.get('/:id', async (req, res) => {
    const email = req.query.email;
    if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
    }

    const id = req.params.id;
    try {
        const data = await prisma.all_blogs.findUnique({
            where: { id: id }
        });
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error.message })
    }
})


module.exports = router
