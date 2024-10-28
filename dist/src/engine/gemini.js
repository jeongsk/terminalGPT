"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiEngine = void 0;
const generative_ai_1 = require("@google/generative-ai");
const context_1 = require("../context");
const gradient_1 = require("../gradient");
const common_1 = require("./common");
const GeminiEngine = async (apiKey, prompt, opts, hasContext = false) => {
    const apiKeyValue = await apiKey;
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKeyValue);
    const spinner = (0, gradient_1.loadWithRocketGradient)("Thinking...").start();
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: opts.model || "gemini-1.5-flash",
        });
        // Generate response
        const generationConfig = {
            temperature: opts.temperature || 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
        // Process and combine messages
        const relevantContext = (0, context_1.getContext)(prompt);
        let processedMessages = (0, common_1.combineConsecutiveMessages)(relevantContext);
        processedMessages = (0, common_1.ensureMessagesAlternate)(processedMessages);
        // Add the current prompt
        processedMessages.push({ role: "user", content: prompt });
        const chatHistory = processedMessages.map((context) => ({
            role: context.role === "assistant" ? "model" : "user",
            parts: [{ text: context.content }],
        }));
        const chatSession = model.startChat({
            generationConfig,
            history: chatHistory,
        });
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();
        if (responseText) {
            if (hasContext) {
                (0, context_1.addContext)({ role: "assistant", content: responseText });
            }
            spinner.stop();
            return responseText;
        }
        else {
            throw new Error("Undefined messages received");
        }
    }
    catch (err) {
        spinner.stop();
        console.error(err);
        throw new Error("An error occurred while generating content");
    }
};
exports.GeminiEngine = GeminiEngine;
