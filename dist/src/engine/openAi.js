"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIEngine = void 0;
const openai_1 = __importDefault(require("openai"));
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../context");
const gradient_1 = require("../gradient");
const common_1 = require("./common");
const OpenAIEngine = async (apiKey, prompt, opts, hasContext = false) => {
    const apiKeyValue = await apiKey;
    const openai = new openai_1.default({ apiKey: apiKeyValue });
    const spinner = (0, gradient_1.loadWithRocketGradient)("Thinking...").start();
    try {
        const relevantContext = (0, context_1.getContext)(prompt);
        // Process and combine messages
        let processedMessages = (0, common_1.combineConsecutiveMessages)(relevantContext);
        processedMessages = (0, common_1.ensureMessagesAlternate)(processedMessages);
        // Add the current prompt
        processedMessages.push({ role: "user", content: prompt });
        const messages = processedMessages.map((item) => ({
            role: item.role,
            content: item.content,
        }));
        const completion = await openai.chat.completions.create({
            model: opts.model || "gpt-4o-2024-08-06",
            messages: messages,
            temperature: opts.temperature ? Number(opts.temperature) : 1,
        });
        const message = completion.choices[0].message;
        if (hasContext) {
            (0, context_1.addContext)({ role: message.role, content: message.content || "" });
        }
        spinner.stop();
        return message.content;
    }
    catch (err) {
        spinner.stop();
        if (err instanceof Error) {
            console.log(err);
            throw new Error(`${chalk_1.default.red(err.message)}`);
        }
        else {
            throw new Error(`${chalk_1.default.red("An unknown error occurred")}`);
        }
    }
};
exports.OpenAIEngine = OpenAIEngine;
