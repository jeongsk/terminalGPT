"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addContext = addContext;
exports.getContext = getContext;
exports.clearContext = clearContext;
/* eslint-disable @typescript-eslint/no-explicit-any */
const tiktoken_1 = require("@dqbd/tiktoken");
const hnswlib_node_1 = __importDefault(require("hnswlib-node"));
const createVectorStore = (model = "gpt-4o", maxTokens = 4096) => {
    const dimension = 1536; // Fixed dimension size
    let index = new hnswlib_node_1.default.HierarchicalNSW("cosine", dimension);
    const items = [];
    let encoder = (0, tiktoken_1.encoding_for_model)(model);
    let currentTokens = 0;
    try {
        encoder = (0, tiktoken_1.encoding_for_model)(model);
        index = new hnswlib_node_1.default.HierarchicalNSW("cosine", dimension);
        index.initIndex(1000); // Initialize index with a maximum of 1000 elements
    }
    catch (error) {
        console.error("Error initializing VectorStore:", error);
        throw new Error("Failed to initialize VectorStore");
    }
    const textToVector = (text) => {
        try {
            const encoded = encoder.encode(text);
            const vector = new Array(dimension).fill(0);
            for (let i = 0; i < encoded.length && i < dimension; i++) {
                vector[i] = encoded[i] / 100; // Simple normalization
            }
            return vector;
        }
        catch (error) {
            console.error("Error converting text to vector:", error);
            throw new Error("Failed to convert text to vector");
        }
    };
    const addItem = (item) => {
        try {
            if (!item || typeof item.content !== "string") {
                console.error("Invalid item:", item);
                return;
            }
            const vector = textToVector(item.content);
            const tokenCount = encoder.encode(item.content).length;
            // Remove old items if adding this would exceed the token limit
            while (currentTokens + tokenCount > maxTokens && items.length > 0) {
                const removedItem = items.shift();
                if (removedItem) {
                    currentTokens -= encoder.encode(removedItem.content).length;
                }
            }
            const id = items.length;
            index.addPoint(vector, id);
            items.push(item);
            currentTokens += tokenCount;
        }
        catch (error) {
            console.error("Error adding item to VectorStore:", error);
        }
    };
    const getRelevantContext = (query, k = 5) => {
        try {
            if (items.length === 0) {
                return [];
            }
            const queryVector = textToVector(query);
            const results = index.searchKnn(queryVector, Math.min(k, items.length));
            if (!results || !Array.isArray(results.neighbors)) {
                return [];
            }
            return results.neighbors.map((id) => items[id] || {
                role: "system",
                content: "Context item not found",
            });
        }
        catch (error) {
            console.error("Error getting relevant context:", error);
            return [];
        }
    };
    return { addItem, getRelevantContext };
};
let vectorStore;
try {
    vectorStore = createVectorStore();
}
catch (error) {
    console.error("Error creating VectorStore:", error);
    throw new Error("Failed to create VectorStore");
}
function addContext(item) {
    const existingItems = vectorStore.getRelevantContext(item.content);
    if (!existingItems.some((existingItem) => existingItem.role === item.role && existingItem.content === item.content)) {
        vectorStore.addItem(item);
    }
}
function getContext(query) {
    return vectorStore.getRelevantContext(query);
}
function clearContext() {
    vectorStore = createVectorStore();
}
