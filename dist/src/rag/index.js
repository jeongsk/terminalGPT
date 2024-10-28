"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const commands_1 = require("../commands");
const utils_1 = require("../utils");
const context_1 = require("../context");
const determinePlugins = async (engine, apiKey, userInput, opts) => {
    // Add user input to context
    (0, context_1.addContext)({ role: "user", content: userInput });
    // Get relevant context
    const relevantContext = (0, context_1.getContext)(userInput);
    const plugins = (0, commands_1.getPlugins)();
    const pluginDescriptions = plugins
        .map((p) => `${p.name} (${p.keyword}): ${p.description}`)
        .join("\n");
    const llmPrompt = `
  Given the following user input, conversation context, and available plugins, determine if any plugins should be used. If so, provide the plugin keyword (with @ handle). If no plugins are applicable, respond with "none".
  
  Available plugins:
  ${pluginDescriptions}
  
  Conversation context:
  ${relevantContext.map((item) => `${item.role}: ${item.content}`).join("\n")}
  
  User input: "${userInput}"
  
  Respond with a single plugin keyword or "none".
  `;
    const response = await (0, utils_1.promptCerebro)(engine, apiKey, llmPrompt, opts);
    // Trim and lowercase the response
    const trimmedResponse = response?.trim().toLowerCase() ?? "none";
    // Check if the response matches any plugin keyword
    const matchedPlugin = plugins.find((p) => p.keyword.toLowerCase() === trimmedResponse);
    // If a matching plugin is found, return its keyword; otherwise, return "none"
    const result = matchedPlugin ? matchedPlugin.keyword : "none";
    // Add AI response to context
    (0, context_1.addContext)({
        role: "assistant",
        content: result,
    });
    return result;
};
exports.default = determinePlugins;
