/**
 * AI service: uses central Groq client and prompts. Logs errors for debugging.
 */
import { getGroqClient } from "./groqClient.js";
import { config } from "../config.js";
import { prompts } from "../prompts/index.js";

function extractCodeBlock(text) {
  const match = text.match(/```[\w]*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/**
 * Single place for Groq completion. Logs success/failure; throws with clear message on failure.
 */
async function complete(systemContent, userContent, model = config.groq.defaultModel, logContext = "") {
  const groq = getGroqClient();
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      max_tokens: config.groq.maxTokens,
      temperature: 0.2,
    });
    const content = response.choices?.[0]?.message?.content ?? "";
    if (logContext) {
      console.log(`[AI] ${logContext} success, model=${model}`);
    }
    return content;
  } catch (e) {
    console.error(`[AI] ${logContext} Groq error:`, e?.message || e);
    if (e?.message?.toLowerCase().includes("api key") || e?.message?.toLowerCase().includes("groq")) {
      throw new Error("GROQ_API_KEY is not set or invalid. Add a valid key to backend/.env");
    }
    throw new Error(e?.message || "AI service request failed");
  }
}

export const aiService = {
  async explain(code, language) {
    const out = await complete(
      prompts.explain.system,
      prompts.explain.user(code, language),
      config.groq.defaultModel,
      "explain"
    );
    return { explanation: out };
  },

  async findBugs(code, language) {
    const out = await complete(
      prompts.bugs.system,
      prompts.bugs.user(code, language),
      config.groq.defaultModel,
      "bugs"
    );
    return { analysis: out };
  },

  async refactor(code, language) {
    const out = await complete(
      prompts.refactor.system,
      prompts.refactor.user(code, language),
      config.groq.defaultModel,
      "refactor"
    );
    return { code: extractCodeBlock(out), raw: out };
  },

  async optimize(code, language) {
    const out = await complete(
      prompts.optimize.system,
      prompts.optimize.user(code, language),
      config.groq.defaultModel,
      "optimize"
    );
    const codeBlock = extractCodeBlock(out);
    const explanation = out.replace(/```[\s\S]*?```/g, "").trim();
    return { code: codeBlock || out, explanation: explanation || "See optimized code above." };
  },

  async convert(code, fromLang, toLang) {
    const out = await complete(
      prompts.convert.system,
      prompts.convert.user(code, fromLang, toLang),
      config.groq.defaultModel,
      "convert"
    );
    return { code: extractCodeBlock(out), raw: out };
  },

  async chat(message, editorContent, model) {
    const system = prompts.chat.system(editorContent || "");
    const user = prompts.chat.user(message);
    const out = await complete(system, user, model || config.groq.defaultModel, "chat");
    return { message: out };
  },

  /**
   * Chat with full message history (for context-aware conversation).
   */
  async chatWithHistory(messages, currentCode, language, model) {
    const system = prompts.chat.system(currentCode || "");
    const groq = getGroqClient();
    const modelId = model || config.groq.defaultModel;
    const apiMessages = [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];
    try {
      const response = await groq.chat.completions.create({
        model: modelId,
        messages: apiMessages,
        max_tokens: config.groq.maxTokens,
        temperature: 0.2,
      });
      const content = response.choices?.[0]?.message?.content ?? "";
      console.log("[AI] chat success, model=", modelId);
      return { message: content };
    } catch (e) {
      console.error("[AI] chat Groq error:", e?.message || e);
      if (e?.message?.toLowerCase().includes("api key") || e?.message?.toLowerCase().includes("groq")) {
        throw new Error("GROQ_API_KEY is not set or invalid. Add a valid key to backend/.env");
      }
      throw new Error(e?.message || "AI service request failed");
    }
  },

  /**
   * Code-editing chat: returns structured JSON describing the action.
   * Ensures JSON-only output and validates required fields.
   */
  async chatCode(message, currentCode, language, model) {
    const system = prompts.code.system(language || "text", currentCode || "");
    const user = prompts.code.user(message);
    const raw = await complete(system, user, model || config.groq.defaultModel, "chat-code");

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("[AI] chat-code invalid JSON:", raw);
      throw new Error("AI returned invalid JSON. Please try again or rephrase.");
    }

    const action = parsed?.action;
    const rationale = typeof parsed?.rationale === "string" ? parsed.rationale : "";
    if (!action || !["apply", "clarify", "noop"].includes(action)) {
      throw new Error("AI response missing valid action (apply|clarify|noop).");
    }

    if (action === "clarify") {
      const question = typeof parsed?.question === "string" && parsed.question.trim();
      if (!question) throw new Error("AI clarification missing question.");
      return { action, question: parsed.question.trim(), rationale };
    }

    if (action === "apply") {
      const code = typeof parsed?.code === "string" ? parsed.code : "";
      if (!code.trim()) throw new Error("AI apply missing code.");
      return { action, code, rationale };
    }

    return { action: "noop", rationale };
  },
};
