"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaEngine = void 0;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../context");
const gradient_1 = require("../gradient");
const axios_1 = __importDefault(require("axios"));
const common_1 = require("./common");
const OllamaEngine = async (apiKey, prompt, opts, hasContext = false, baseURL = "http://localhost:11434") => {
    const apiKeyValue = await apiKey;
    const spinner = (0, gradient_1.loadWithRocketGradient)("Thinking...").start();
    const relevantContext = (0, context_1.getContext)(prompt);
    try {
        // Process and combine messages
        let processedMessages = (0, common_1.combineConsecutiveMessages)(relevantContext);
        processedMessages = (0, common_1.ensureMessagesAlternate)(processedMessages);
        // Add the current prompt
        processedMessages.push({ role: "user", content: prompt });
        const response = await axios_1.default.post(`${baseURL}/api/chat`, {
            model: opts.model || "llama2", // Use a default model if none is provided
            messages: processedMessages.map((item) => ({
                role: item.role,
                content: item.content,
            })),
            temperature: opts.temperature ? Number(opts.temperature) : 1,
        }, {
            headers: {
                Authorization: `Bearer ${apiKeyValue}`,
                "Content-Type": "application/json",
            },
        });
        const message = response.data.message?.content;
        if (message) {
            if (hasContext) {
                (0, context_1.addContext)({ role: "assistant", content: message });
            }
            spinner.stop();
            return message;
        }
        else {
            throw new Error("Undefined messages received");
        }
    }
    catch (err) {
        spinner.stop();
        // Error handling remains the same
        if (axios_1.default.isAxiosError(err)) {
            console.log(err);
            switch (err.response?.status) {
                case 404:
                    throw new Error(`${chalk_1.default.red("Not Found: Model not found. Please check the model name.")}`);
                case 429:
                    throw new Error(`${chalk_1.default.red("API Rate Limit Exceeded: Too many requests. Please wait before trying again.")}`);
                case 400:
                    throw new Error(`${chalk_1.default.red("Bad Request: Prompt provided is empty or too long.")}`);
                case 500:
                    throw new Error(`${chalk_1.default.red("Internal Server Error: Please try again later.")}`);
                default:
                    throw new Error(`${chalk_1.default.red("An unknown error occurred")}`);
            }
        }
        else {
            throw new Error(`${chalk_1.default.red("An unknown error occurred")}`);
        }
    }
};
exports.OllamaEngine = OllamaEngine;
