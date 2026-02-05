/**
 * Single Groq client instance. Lazy-init so missing API key doesn't crash at load.
 * Reused for all AI requests.
 */
import Groq from "groq-sdk";
import { config } from "../config.js";

let client = null;

export function getGroqClient() {
  if (!config.groq.apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to backend/.env");
  }
  if (!client) {
    client = new Groq({ apiKey: config.groq.apiKey });
  }
  return client;
}
