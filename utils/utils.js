// utils/gemini.js
const fetch = require("node-fetch");






const generateGeminiResponse = async (userMessage,summaryPrompt) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // safer naming — no NEXT_PUBLIC_ prefix

        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API key is missing. Please check your environment variables.");
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `${summaryPrompt} ${userMessage.trim()}.`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Gemini API error:", errorData);
            throw new Error("Failed to get response from Gemini API");
        }

        const data = await response.json();

        const aiResponseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn’t generate a response.";

        return aiResponseText;
    } catch (error) {
        console.error("Error generating Gemini response:", error.message);
        return "An internal error occurred while generating the response.";
    }
};




module.exports = { generateGeminiResponse };
