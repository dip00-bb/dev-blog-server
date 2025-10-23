const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    console.log("user Id from meta data",id)

    try {
        const session = await stripe.checkout.sessions.retrieve(id, {
            expand: ["payment_intent"],
        });

        res.status(200).json(session);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
