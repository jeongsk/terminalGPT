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
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.getEngine = getEngine;
exports.saveCredentials = saveCredentials;
exports.getCredentials = getCredentials;
exports.deleteCredentials = deleteCredentials;
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const algorithm = "aes-256-cbc";
const secretKeyFile = path.join(__dirname, "secret_key.txt");
// Function to generate and save a secret key
function generateAndSaveSecretKey() {
    const secretKey = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(secretKeyFile, secretKey, "utf8");
    return secretKey;
}
// Function to get or create the secret key
function getSecretKey() {
    if (fs.existsSync(secretKeyFile)) {
        return fs.readFileSync(secretKeyFile, "utf8");
    }
    else {
        return generateAndSaveSecretKey();
    }
}
const secretKey = getSecretKey();
function isEncrypted(text) {
    return text.includes(":") && /^[0-9a-f]+:[0-9a-f]+$/.test(text);
}
/**
 * Encrypts the given text using the specified algorithm, secret key, and initialization vector.
 *
 * @param {string} text - The text to be encrypted.
 * @return {string} The encrypted text in the format: IV:encryptedText.
 */
function encrypt(text) {
    if (isEncrypted(text)) {
        return text;
    }
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(secretKey, "salt", 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}
/**
 * Decrypts the given text using a specific algorithm and secret key.
 *
 * @param {string} text - The text to be decrypted.
 * @return {string} - The decrypted text.
 */
function decrypt(text) {
    if (!text) {
        return null;
    }
    if (!isEncrypted(text)) {
        return text;
    }
    const [ivHex, encryptedHex] = text.split(":");
    if (!ivHex || !encryptedHex) {
        return null;
    }
    try {
        const iv = Buffer.from(ivHex, "hex");
        const encrypted = Buffer.from(encryptedHex, "hex");
        const key = crypto.scryptSync(secretKey, "salt", 32);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const result = decrypted.toString("utf8");
        return result;
    }
    catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}
/**
 * Retrieves the API engine from the "engine.txt" file.
 *
 * @return {string | null} The API engine if the file exists, otherwise null.
 */
function getEngine() {
    if (fs.existsSync(`${__dirname}/engine.txt`)) {
        const getEngine = fs.readFileSync(`${__dirname}/engine.txt`, "utf8");
        return getEngine;
    }
    return null;
}
/**
 * Saves the API key and engine to a JSON file.
 *
 * @param {string} apiKey - The API key to save.
 * @param {string} engine - The API engine to save.
 * @return {void} This function does not return anything.
 */
function saveCredentials(apiKey, engine, model, tavilyApiKey) {
    const credentials = {
        apiKey: encrypt(apiKey),
        engine,
        tavilyApiKey: tavilyApiKey ? encrypt(tavilyApiKey) : undefined,
        model,
    };
    fs.writeFileSync(`${__dirname}/credentials.json`, JSON.stringify(credentials, null, 2));
    console.log("Credentials saved successfully");
}
/**
 * Retrieves the API key and engine from the "credentials.json" file.
 *
 * @return {{ apiKey: string | null, engine: string | null, tavilyApiKey: string | null }} The API key and engine, or null if the file does not exist.
 */
function getCredentials() {
    if (fs.existsSync(`${__dirname}/credentials.json`)) {
        try {
            const data = fs.readFileSync(`${__dirname}/credentials.json`, "utf8");
            const { apiKey, engine, tavilyApiKey, model } = JSON.parse(data);
            return {
                apiKey: apiKey ? decrypt(apiKey) : null,
                engine: engine || null,
                tavilyApiKey: tavilyApiKey ? decrypt(tavilyApiKey) : null,
                model: model || null,
            };
        }
        catch (error) {
            console.error("Error reading or parsing credentials:", error);
            return { apiKey: null, engine: null, tavilyApiKey: null, model: null };
        }
    }
    console.log("Credentials file not found");
    return { apiKey: null, engine: null, tavilyApiKey: null, model: null };
}
/**
 * Deletes the credentials file if it exists.
 *
 * @return {boolean} Returns true if the credentials file was deleted, false otherwise.
 */
function deleteCredentials() {
    const credentialsFilePath = `${__dirname}/credentials.json`;
    if (fs.existsSync(credentialsFilePath)) {
        fs.unlinkSync(credentialsFilePath);
        return true;
    }
    return false;
}
