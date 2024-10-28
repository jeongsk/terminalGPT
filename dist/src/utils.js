"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as clipboard from "clipboardy";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsLatestVersion = exports.promptCerebro = exports.promptResponse = void 0;
exports.apiKeyPrompt = apiKeyPrompt;
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const marked_1 = require("marked");
const marked_terminal_1 = __importDefault(require("marked-terminal"));
const Engine_1 = require("./engine/Engine");
const creds_1 = require("./creds");
const version_1 = require("./version");
const package_json_1 = __importDefault(require("../package.json"));
marked_1.marked.setOptions({
    // Define custom renderer
    renderer: new marked_terminal_1.default(),
});
/**
 * Prompts the user for an API key and engine, then saves them.
 *
 * @return {{ apiKey: string, engine: string }} The API key and engine entered by the user.
 */
async function apiKeyPrompt() {
    const credentials = (0, creds_1.getCredentials)();
    const apiKey = credentials?.apiKey;
    const engine = credentials?.engine;
    const model = credentials?.model;
    const questions = [
        {
            type: "select",
            name: "engine",
            message: "Pick LLM",
            choices: [
                { title: "OpenAI", value: "openAI" },
                { title: "Anthropic", value: "anthropic" },
                { title: "Gemini", value: "gemini" },
                { title: "Ollama", value: "ollama" },
            ],
            initial: 0,
        },
        {
            type: (prev) => (prev === "ollama" ? null : "password"),
            name: "apiKey",
            message: (prev) => `Enter your ${prev} API key:`,
            validate: (value) => value !== "",
        },
        {
            type: (prev, values) => (values.engine === "ollama" ? null : "select"),
            name: "model",
            message: "Select model",
            choices: (prev, values) => {
                switch (values.engine) {
                    case "openAI":
                        return [
                            { title: "GPT-3.5-turbo", value: "gpt-3.5-turbo" },
                            { title: "GPT-4", value: "gpt-4" },
                            { title: "GPT-4o", value: "gpt-4o" },
                            { title: "GPT-o1 Preview", value: "o1-preview" },
                            { title: "GPT-4o Mini", value: "gpt-4o-mini" },
                            { title: "GPT-o1 Mini", value: "o1-mini" },
                        ];
                    case "anthropic":
                        return [
                            { title: "Claude 2", value: "claude-2" },
                            { title: "Claude 3 Opus", value: "claude-3-opus-20240229" },
                            { title: "Claude 3 Sonnet", value: "claude-3-sonnet-20240229" },
                        ];
                    case "gemini":
                        return [{ title: "Gemini Pro", value: "gemini-pro" }];
                    default:
                        return [];
                }
            },
        },
    ];
    if (!apiKey || !engine || !model) {
        const response = await (0, prompts_1.default)(questions);
        // Save API key, engine, and model
        (0, creds_1.saveCredentials)((0, creds_1.encrypt)(response.apiKey), response.engine, response.model);
        return {
            apiKey: response.apiKey,
            engine: response.engine,
            model: response.model,
        };
    }
    return { apiKey, engine, model };
}
/**
 * Checks a block of code for matches and prompts the user to copy the code to the clipboard.
 *
 * @param {string} text - The text to search for matches within ``` code blocks.
 * @return {void} This function does not return a value.
 */
// async function checkBlockOfCode(text: string) {
//   // get all matches of text within ```
//   const regex = /```[\s\S]*?```/g;
//   const matches = text.match(regex);
//   if (matches) {
//     const recentTextNoBackticks = matches[0].replace(/```/g, "");
//     const response = await prompts({
//       type: "confirm",
//       name: "copy",
//       message: `Copy recent code to clipboard?`,
//       initial: true,
//     });
//     if (response.copy) {
//       clipboard.writeSync(recentTextNoBackticks);
//     }
//   }
// }
/**
 * Generates a response based on the given API key, prompt, response, and options.
 *
 * @param {string} engine - The engine to use for generating the response.
 * @param {() => void} prompt - The function to prompt the user.
 * @param {prompts.Answers<string>} response - The user's response.
 * @param {{ temperature?: number; markdown?: boolean; model: string; }} opts - The options for generating the response.
 * @return {Promise<void>} A promise that resolves when the response is generated.
 */
const promptResponse = async (engine, apiKey, userInput, opts) => {
    try {
        const request = await (0, Engine_1.generateResponse)(engine, apiKey, userInput, {
            model: opts.model,
            temperature: opts.temperature,
        }, true);
        const text = request ?? "";
        if (!text) {
            throw new Error("Undefined request or content");
        }
        console.log(`${chalk_1.default.cyan("Answer: ")}`);
        const markedText = marked_1.marked.parse(text);
        for (let i = 0; i < markedText.length; i++) {
            process.stdout.write(markedText[i]);
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }
    catch (err) {
        console.error(`${chalk_1.default.red("Something went wrong!!")} ${err}`);
        // Error handling remains the same
        // ...
    }
};
exports.promptResponse = promptResponse;
const promptCerebro = async (engine, apiKey, userInput, opts) => {
    try {
        const request = await (0, Engine_1.generateResponse)(engine, apiKey, userInput, {
            model: opts.model,
            temperature: opts.temperature,
        }, false);
        const text = request ?? "";
        if (!text) {
            throw new Error("Undefined request or content");
        }
        return text;
    }
    catch (err) {
        console.error(`${chalk_1.default.red("Something went wrong!!")} ${err}`);
        // Error handling remains the same
        // ...
    }
};
exports.promptCerebro = promptCerebro;
const checkIsLatestVersion = async () => {
    const latestVersion = await (0, version_1.getTerminalGPTLatestVersion)();
    if (latestVersion) {
        const currentVersion = package_json_1.default.version;
        if (currentVersion !== latestVersion) {
            console.log(chalk_1.default.yellow(`
    You are not using the latest stable version of TerminalGPT with new features and bug fixes.
    Current version: ${currentVersion}. Latest version: ${latestVersion}.
    🚀 To update run: npm i -g terminalgpt@latest.
    Or run @update to update the package.
        `));
        }
    }
};
exports.checkIsLatestVersion = checkIsLatestVersion;
