#!/usr/bin/env node
"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const commander_1 = require("commander");
const intro_1 = __importDefault(require("./intro"));
const utils_1 = require("./utils");
const creds_1 = require("./creds");
const readline_1 = __importDefault(require("readline"));
const commands_1 = require("./commands");
const rag_1 = __importDefault(require("./rag"));
const program = new commander_1.Command();
program
    .command("chat")
    .option("-e, --engine <engine>", "LLM to use")
    .option("-t, --temperature <temperature>", "Response temperature")
    .usage(`"<project-directory>" [options]`)
    .action(async (opts) => {
    (0, intro_1.default)();
    await (0, utils_1.checkIsLatestVersion)();
    const creds = await (0, utils_1.apiKeyPrompt)();
    // Initialize plugins
    (0, commands_1.initializePlugins)();
    const prompt = () => {
        process.stdout.write(chalk_1.default.blueBright("\nYou: "));
        process.stdin.resume();
        process.stdin.setEncoding("utf-8");
        process.stdin.once("data", async (data) => {
            const userInput = data.toString().trim();
            if (creds.apiKey != null) {
                try {
                    // Direct plugin call
                    const plugin = (0, commands_1.findPlugin)(userInput);
                    if (plugin) {
                        console.log(chalk_1.default.yellow(`Executing plugin: ${plugin.name}`));
                        await (0, commands_1.executePlugin)(plugin, {
                            userInput,
                            engine: creds.engine,
                            apiKey: creds.apiKey,
                            opts: { ...opts, model: creds.model || undefined },
                        });
                    }
                    else {
                        // Use LLM to determine if a plugin should be used
                        const pluginKeyword = await (0, rag_1.default)(creds.engine, creds.apiKey, userInput, { ...opts, model: creds.model || undefined });
                        if (pluginKeyword !== "none") {
                            const plugin = (0, commands_1.findPlugin)(pluginKeyword);
                            if (plugin) {
                                console.log(chalk_1.default.yellow(`Executing plugin: ${plugin.name}`));
                                await (0, commands_1.executePlugin)(plugin, {
                                    userInput,
                                    engine: creds.engine,
                                    apiKey: creds.apiKey,
                                    opts: { ...opts, model: creds.model || undefined },
                                });
                            }
                            else {
                                console.log(chalk_1.default.red(`Plugin not found: ${pluginKeyword}`));
                            }
                        }
                        else {
                            // No plugin applicable, use regular promptResponse
                            await (0, utils_1.promptResponse)(creds.engine, creds.apiKey, userInput, {
                                ...opts,
                                model: creds.model || undefined,
                            });
                        }
                    }
                }
                catch (error) {
                    console.error(chalk_1.default.red("An error occurred:"), error);
                }
            }
            else {
                console.log(chalk_1.default.red("API key is required for chat functionality."));
            }
            prompt();
        });
    };
    prompt();
});
program
    .command("delete")
    .description("Delete your API key")
    .action(async () => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question("Are you sure? (yes/no): ", (answer) => {
        if (answer.toLowerCase() === "yes") {
            const apiKeyDeleted = (0, creds_1.deleteCredentials)();
            if (apiKeyDeleted) {
                console.log("API key deleted");
            }
            else {
                console.log("API key file not found, no action taken.");
            }
        }
        else {
            console.log("Deletion cancelled");
        }
        rl.close();
        process.exit(0);
    });
});
program.parse(process.argv);
