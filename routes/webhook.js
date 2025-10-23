const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', async (req, res) => {

    console.log("I amd inside1")

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log("i am inside 2")
        try {
            const userId = session.metadata.userId;

            if (!userId) {
                console.error('❌ No userId found in metadata');
                return res.status(200).send('No userId in metadata');
            }

            await prisma.users.update({
                where: { userId: userId },
                data: {
                    isSubscribed: true,
                }
            });

        } catch (dbError) {
            console.error('Database Error:', dbError.message);

        }
    }


    res.status(200).json({ received: true });
});

module.exports = router;