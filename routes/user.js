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


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await prisma.users.findUnique({
      where: { userId: id },
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User found",
      userPaymentStatus: userData.isSubscribed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});









module.exports = router