const express = require('express');
const router = express.Router();



router.post('/', async (req, res) => {
    const {description} = req.body

    try {
        if (!description) {
            return res.status(400).send({ error: 'No text provided' });
        } else {
            // Simulate AI text generation
            const generatedText = `AI Generated Content based on: ${description}`;
            console.log(generatedText)
            return res.status(200).send({ generatedText: description });
        }

    } catch (error) {

    }
})

module.exports = router;