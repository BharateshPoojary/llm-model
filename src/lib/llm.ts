import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const streamingModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  maxOutputTokens: 768,
  streaming: true,
  verbose: true,
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY as string,
});

export const nonStreamingModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  maxOutputTokens: 768,
  verbose: true,
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY as string,
});
