import { GeminiClient } from "./client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

export const geminiClient = new GeminiClient(GEMINI_API_KEY);
