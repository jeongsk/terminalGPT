"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTerminalGPTLatestVersion = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const getTerminalGPTLatestVersion = async () => {
    try {
        const { stdout } = await execAsync("npm view terminalgpt version");
        return stdout.trim();
    }
    catch (error) {
        console.error("Error while getting the latest version of TerminalGPT:", error);
        return undefined;
    }
};
exports.getTerminalGPTLatestVersion = getTerminalGPTLatestVersion;
