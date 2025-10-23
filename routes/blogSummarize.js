const express = require('express');
const { generateGeminiResponse } = require('../utils/utils');
const router = express.Router();



router.post('/', async (req, res) => {
    const { text } = req.body

    const summaryPrompt = `You are an expert content summarizer for a blogging platform.
                                    Your task is to read the following blog article and generate a clear, engaging, and concise summary. 
                                    eep the tone neutral, highlight the main ideas, and avoid unnecessary details or repetition.
                                    If the content includes opinions or arguments, summarize them fairly and accurately.
                                    Blog content:`
    try {
        if (!text) {
            return res.status(400).send({ error: 'No text provided' });
        } else {
            const generatedText = await generateGeminiResponse(text, summaryPrompt);
            return res.status(200).send({ generatedSummary: generatedText });
        }

    } catch (error) {

    }
})

module.exports = router;