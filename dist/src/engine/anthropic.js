"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicEngine = void 0;
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const context_1 = require("../context");
const gradient_1 = require("../gradient");
const chalk_1 = __importDefault(require("chalk"));
const combineConsecutiveMessages = (messages) => {
    if (messages.length === 0)
        return messages;
    const combinedMessages = [messages[0]];
    for (let i = 1; i < messages.length; i++) {
        const lastMessage = combinedMessages[combinedMessages.length - 1];
        const currentMessage = messages[i];
        if (currentMessage.role === lastMessage.role) {
            lastMessage.content += "\n" + currentMessage.content;
        }
        else {
            combinedMessages.push(currentMessage);
        }
    }
    return combinedMessages;
};
const ensureMessagesAlternate = (messages) => {
    const alternatingMessages = [];
    // Ensure the first message is from the user
    let expectedRole = "user";
    for (const message of messages) {
        if (message.role !== expectedRole) {
            // Skip or adjust message
            continue; // or handle as needed
        }
        alternatingMessages.push(message);
        expectedRole = expectedRole === "user" ? "assistant" : "user";
    }
    return alternatingMessages;
};
const AnthropicEngine = async (apiKey, prompt, opts, hasContext = false) => {
    const apiKeyValue = await apiKey;
    const anthropic = new sdk_1.default({ apiKey: apiKeyValue });
    const spinner = (0, gradient_1.loadWithRocketGradient)("Thinking...").start();
    try {
        const relevantContext = (0, context_1.getContext)(prompt);
        let messages = [];
        let systemMessage = "";
        // Process relevant context
        for (const item of relevantContext) {
            if (item.role === "system") {
                systemMessage += item.content + "\n";
            }
            else {
                messages.push(item);
            }
        }
        // Combine consecutive messages with the same role
        messages = combineConsecutiveMessages(messages);
        // Ensure messages start with 'user' and roles alternate
        messages = ensureMessagesAlternate(messages);
        // Add the current prompt as a 'user' message
        if (messages.length === 0 ||
            messages[messages.length - 1].role !== "user") {
            messages.push({ role: "user", content: prompt });
        }
        else {
            messages[messages.length - 1].content += "\n" + prompt;
        }
        const requestParams = {
            model: opts.model || "claude-3-opus-20240229",
            messages: messages,
            system: systemMessage.trim() || undefined,
            temperature: opts.temperature ? Number(opts.temperature) : 1,
            max_tokens: 1024,
        };
        const response = await anthropic.messages.create(requestParams);
        const message = response.content
            .filter((block) => block.type === "text")
            .map((block) => (block.type === "text" ? block.text : ""))
            .join("\n");
        if (message) {
            if (hasContext) {
                (0, context_1.addContext)({ role: "user", content: prompt });
                (0, context_1.addContext)({ role: "assistant", content: message });
            }
            spinner.stop();
            return message;
        }
        else {
            throw new Error("No text content received in the response");
        }
    }
    catch (err) {
        spinner.stop();
        if (err instanceof Error) {
            console.error(err);
            throw new Error(`${chalk_1.default.red(err.message)}`);
        }
        else {
            throw new Error(`${chalk_1.default.red("An unknown error occurred")}`);
        }
    }
};
exports.AnthropicEngine = AnthropicEngine;
