"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = intro;
const chalk_1 = __importDefault(require("chalk"));
const gradient_string_1 = __importDefault(require("gradient-string"));
/**
 * Displays the introduction message for TerminalGPT.
 *
 * @return {void} No return value.
 */
async function intro() {
    const asciiArt = `
                                          
                                                                                
                                     ddiiidd                                    
                                 6diiiiiiiiiiid0                                
                             dddiiiiiiiiiiiiiiiiidd0                            
                          ddiiiiiiiidiiiiiiiidiiiiiiid0                         
                      ddiiiiiiiiiiiiiidiiiiiiiiiiiiiiiiiidd                     
                     0ddiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiid                    
                     00000ddiiiiiiiiiiiiiiiiiiiiiiiiiidiiiid                    
                     0d0000000diiiiiiiiiiiiiiiiiiidddiiiiiid                    
                     0d0000000000ddiiiidiiiiiiddddiiididiidd                    
                     0000000000000000ddiiiiddddiddddiiiiiiid                    
                     0d00000000000000000ddddddiddiidiiiiiiid                    
                     0d00000000000000000ddddddidddididiiiiid                    
                     0000000000000000000dddddddiiddiiiidiiid                    
                     0000000000000000000dddddddddiddiiiiiiid                    
                     0d00000000000000000dddddiiddiididiiiidd                    
                     0d00000000000000000dddddddiddidiiidiiid                    
                     0000000000000000000dddddddiddidiiiiiiid                    
                      000000000000000000ddddddiddiddiddiidd                     
                         000000000000000dddddiddiddiiidd                        
                           6000000000000dddddddiddidd                           
                               000000000dddddddid0                              
                                  000000ddddddd                                 
                                     000dddd                                    
 `;
    const coloredAscii = (0, gradient_string_1.default)("magenta", "cyan").multiline(asciiArt);
    const usageText = `
 
  ${coloredAscii}
  Welcome to ${chalk_1.default.greenBright("TerminalGPT")} 
  ${chalk_1.default.cyanBright("Created by @jucasoliveira: https://github.com/jucasoliveira")}

  ${chalk_1.default.cyanBright("TerminalGPT is maintained by Warpy as of Jan 2024. Check out other OS initiatives at:")}

  ${chalk_1.default.blueBright("https://github.com/warpy-ai")}


  ${chalk_1.default.yellowBright("Usage:")}
    TerminalGPT will ask for your API key. It will be encrypted and saved locally.

    Type your message and press enter. TerminalGPT will respond.

    TerminalGPT is enhanced with plugins. To use a plugin, start your message with the plugin keyword (e.g., @web for web search).
    Or you can start chatting and TerminalGPT will suggest plugins based on your message.

    ${chalk_1.default.yellowBright("Available Plugins:")}
    ${chalk_1.default.cyanBright("@list")} - Lists all available plugins

    ${chalk_1.default.yellowBright("Other Commands:")}
    ${chalk_1.default.cyanBright("delete")} - Delete the saved API key
    ${chalk_1.default.cyanBright("chat")} - Start a new chat session
    ${chalk_1.default.cyanBright("--markdown")} - Display the response in markdown format

    To exit, type "${chalk_1.default.redBright("exit")}" or use the ${chalk_1.default.cyanBright("@exit")} plugin.

  ${chalk_1.default.greenBright("Start chatting or use a plugin to begin!")}
  `;
    console.log(usageText);
}
