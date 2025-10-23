const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



router.post('/', async (req, res) => {
    const { userId } = req.body;
    console.log(req.body)
    try {
        // check if userId already exists
        const existing = await prisma.users.findUnique({
            where: { userId },
        });

        if (existing) {
            return res.status(200).json({ message: "User already subscribed." });
        }

        // create new record
        const newSub = await prisma.users.create({
            data: {
                userId,
                isSubscribed: false,
            },
        });

        res.status(201).json({ message: "Subscription created.", newSub });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }


})

module.exports = router