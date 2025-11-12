const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    try {
        const data = req.body;


        // Validate required fields
        if (!data.userId || !data.amountPaid) {
            return res.status(400).json({
                error: 'Missing required fields: userId and amountPaid'
            });
        }

        // Create a Stripe customer
        const customer = await stripe.customers.create({
            email:'',
            name: data.name,
            address: {
                city: "Dhaka",
                country: "BD",
                line1: "N/A",
                postal_code: "1000",
                state: "Dhaka",
            },
        });

        // Create a checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer: customer.id,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        product_data: {
                            name: data.name || 'Premium Subscription',
                            description: data.description || 'Blog subscription',
                        },
                        currency: "bdt",
                        unit_amount: Math.round(data.amountPaid * 100), // Ensure integer
                    },
                },
            ],
            // ✅ FIXED: Only string values in metadata
            metadata: {
                userId: data?.userId,
                name: data?.name,
                amountPaid: data?.amountPaid,
                redirectUrlId:data?.blogId

            },
            success_url: `https://blog-website-724fe.web.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://blog-website-724fe.web.app/payment-cancel`,
        });

        res.status(200).json({ success: true, url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;