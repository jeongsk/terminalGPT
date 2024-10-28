"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMessagesAlternate = exports.combineConsecutiveMessages = void 0;
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
exports.combineConsecutiveMessages = combineConsecutiveMessages;
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
exports.ensureMessagesAlternate = ensureMessagesAlternate;
