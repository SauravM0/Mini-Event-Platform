require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel(modelName) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY is missing from environment variables.");
        return;
    }
    console.log("API Key Status: Present (" + process.env.GEMINI_API_KEY.substring(0, 4) + "...)");

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("SUCCESS: Response received.");
        console.log("Output:", response.text().substring(0, 50) + "...");
        return true;
    } catch (error) {
        console.error("FAILURE:");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }
        return false;
    }
}

async function runDiagnostics() {
    // Test: gemini-2.0-flash-lite (User requested)
    await testModel("gemini-2.0-flash-lite");
}

runDiagnostics();
