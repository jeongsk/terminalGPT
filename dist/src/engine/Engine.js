"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = generateResponse;
const openAi_1 = require("./openAi"); // Import OpenAI engine
const anthropic_1 = require("./anthropic"); // Import Anthropic engine
const gemini_1 = require("./gemini"); // Import Gemini engine
const ollama_1 = require("./ollama"); // Import Ollama engine
/**
 * Creates an AI engine instance based on the specified engine type.
 * @param engineType - The type of AI engine to create.
 * @param config - The configuration for the AI engine.
 * @returns An instance of the AI engine.
 */
const Engine = (engineType, config) => {
    const engineResponse = (prompt, opts) => {
        const engineOptions = {
            model: config.model,
            temperature: opts?.temperature,
        };
        switch (engineType) {
            case "openAI":
                return (0, openAi_1.OpenAIEngine)(config.apiKey, prompt, engineOptions, config.hasContext);
            case "anthropic":
                return (0, anthropic_1.AnthropicEngine)(config.apiKey, prompt, engineOptions, config.hasContext);
            case "gemini":
                return (0, gemini_1.GeminiEngine)(config.apiKey, prompt, engineOptions, config.hasContext);
            case "ollama":
                return (0, ollama_1.OllamaEngine)(config.apiKey, prompt, engineOptions, config.hasContext, config.baseURL);
            default:
                throw new Error("Unsupported engine type");
        }
    };
    return { config, engineResponse };
};
/**
 * Main function to generate a response using the specified AI engine.
 * @param engineType - The type of engine to use.
 * @param apiKey - The API key for authentication.
 * @param prompt - The prompt to send to the AI engine.
 * @param opts - Additional options for generating the response.
 * @returns The generated response from the AI engine.
 */
async function generateResponse(engineType, apiKey, prompt, opts, hasContext = false) {
    const config = {
        apiKey,
        model: opts.model,
        maxTokensOutput: 8192,
        maxTokensInput: 4096,
        hasContext,
    };
    const engine = Engine(engineType, config);
    return await engine.engineResponse(prompt, {
        temperature: opts.temperature,
    });
}
