/* eslint-disable */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv doesn't override easily or might not pick it up by default logic
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // For some reason listModels might not be directly exposed on the instance in older versions or specific ways?
        // Actually it is usually on the class or a manager.
        // Let's try to just generate content with a few common models to see which one works.

        const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const modelName of models) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} works!`);
                return; // Found one
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
