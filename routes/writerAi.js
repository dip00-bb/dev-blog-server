const express = require('express');
const { generateGeminiResponse } = require('../utils/utils');
const router = express.Router();
const app = express()
app.use(express.json());


router.post('/', async (req, res) => {
    const { description } = req.body

    const writerHelperPrompt = `You are an advanced writing assistant for a blogging platform.
        Your job is to improve the user’s writing while keeping their original meaning and tone intact.

    When rewriting the given text:
    - Fix all grammar, spelling, and punctuation errors.
    - Make the sentences flow more naturally and clearly.
    - Keep the tone consistent with the original — if it’s personal, professional, or casual, preserve that.
    - Do not shorten or summarize the content; only refine and enhance it.
    -If the writing is unclear, rephrase it in a way that is easy to read and sounds natural.
    - Ensure the final output is polished and well-structured.
    -Write the improved version of the following text.
    -Elavate the writing to make it more engaging and compelling.

`

    try {
        if (!description) {
            return res.status(400).send({ error: 'No text provided' });
        } else {
            // Simulate AI text generation
            const generatedText = await generateGeminiResponse(description, writerHelperPrompt);
            console.log(generatedText)
            return res.status(200).send({ generatedText: generatedText });
        }

    } catch (error) {
        return res.status(500).send({error:"something went wrong"});
    }
})

module.exports = router;