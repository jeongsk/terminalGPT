"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePlugins = exports.executePlugin = exports.findPlugin = exports.getPlugins = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const plugins = [];
const loadPlugins = () => {
    const pluginDir = path.join(__dirname);
    const files = fs.readdirSync(pluginDir);
    // Clear existing plugins to prevent duplicates on reload
    plugins.length = 0;
    const loadedPlugins = new Set(); // To track loaded plugins
    files.forEach((file) => {
        if (file.endsWith(".ts") && file !== "index.ts") {
            const pluginPath = path.join(pluginDir, file);
            const pluginName = path.basename(file, ".ts");
            // Check if plugin has already been loaded
            if (!loadedPlugins.has(pluginName)) {
                try {
                    const plugin = require(pluginPath).default;
                    if (isValidPlugin(plugin)) {
                        plugins.push(plugin);
                        loadedPlugins.add(pluginName);
                    }
                    else {
                        console.warn(`Invalid plugin structure in ${file}`);
                    }
                }
                catch (error) {
                    console.error(`Error loading plugin ${file}:`, error);
                }
            }
        }
    });
};
const isValidPlugin = (plugin) => {
    return (plugin &&
        typeof plugin.name === "string" &&
        typeof plugin.keyword === "string" &&
        typeof plugin.description === "string" &&
        typeof plugin.execute === "function");
};
const getPlugins = () => {
    return plugins;
};
exports.getPlugins = getPlugins;
const findPlugin = (userInput) => {
    return plugins.find((plugin) => userInput.startsWith(plugin.keyword));
};
exports.findPlugin = findPlugin;
const executePlugin = async (plugin, context) => {
    return await plugin.execute(context);
};
exports.executePlugin = executePlugin;
const initializePlugins = () => {
    loadPlugins();
};
exports.initializePlugins = initializePlugins;
// Load plugins when this module is imported
(0, exports.initializePlugins)();
