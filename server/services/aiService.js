const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

// Initialize the API client lazily or on import if key exists
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

/**
 * Generates an event description based on the title and optional draft.
 * @param {string} title - The title of the event.
 * @param {string} [draftDescription] - Use existing description as context if available.
 * @returns {Promise<string>} - The generated description.
 */
exports.generateEventDescription = async (title, draftDescription = "") => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Server configuration error: AI service is not enabled.");
    }

    if (!model) {
        throw new Error("AI Model not initialized.");
    }

    try {
        let prompt = `You are a helpful assistant for an event platform. Write a short, engaging description for an event titled "${title}".`;

        if (draftDescription && draftDescription.trim().length > 0) {
            prompt += `\n\nThe user has already written this draft: "${draftDescription}". Please enhance and polish this description.`;
        } else {
            prompt += `\n\nMake it exciting and inviting. Keep it STRICTLY under 500 characters. Return ONLY the description text, no markdown, no quotes.`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup output if necessary (sometimes models add quotes or extra whitespace)
        text = text.trim().replace(/^["']|["']$/g, '');

        // Enforce 500 character limit as requested
        if (text.length > 500) {
            text = text.substring(0, 497) + "...";
        }

        return text;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate description from AI service.");
    }
};
