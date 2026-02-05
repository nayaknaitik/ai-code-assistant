/**
 * Central prompt templates for all AI features.
 * Keeps prompts maintainable and consistent.
 */

const SYSTEM_PREFIX = `You are an expert software engineer assistant. Be concise, accurate, and professional. Output only what is requested—no preamble or meta-commentary unless asked.`;

export const prompts = {
  explain: {
    system: `${SYSTEM_PREFIX} Explain code clearly: high-level purpose, then line-by-line where helpful, and note time/space complexity if relevant.`,
    user: (code, language) =>
      `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
  },

  bugs: {
    system: `${SYSTEM_PREFIX} Identify potential bugs and logical errors. For each: describe the issue, where it occurs, and provide a concrete fix (code snippet).`,
    user: (code, language) =>
      `Find bugs and suggest fixes in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
  },

  refactor: {
    system: `${SYSTEM_PREFIX} Refactor for readability and best practices. Preserve behavior. Prefer clear names, small functions, and standard idioms. Return only the refactored code in a single code block.`,
    user: (code, language) =>
      `Refactor this ${language} code for readability and best practices. Output only the refactored code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
  },

  optimize: {
    system: `${SYSTEM_PREFIX} Optimize for performance (time and space). Preserve behavior. Return the optimized code in a single code block, then briefly list optimizations made.`,
    user: (code, language) =>
      `Optimize this ${language} code for performance. Output optimized code in a code block, then a short list of changes:\n\n\`\`\`${language}\n${code}\n\`\`\``,
  },

  convert: {
    system: `${SYSTEM_PREFIX} Convert code to the target language. Preserve logic and behavior. Use idiomatic constructs. Return only the converted code in a single code block.`,
    user: (code, fromLang, toLang) =>
      `Convert this ${fromLang} code to ${toLang}. Output only the ${toLang} code in a code block:\n\n\`\`\`${fromLang}\n${code}\n\`\`\``,
  },

  chat: {
    system: (context) =>
      `${SYSTEM_PREFIX} The user may reference "the code" or "current file"—use this context when relevant:\n\n\`\`\`\n${context || "(no code provided)"}\n\`\`\``,
    user: (message) => message,
  },

  /**
   * Code-editing mode: strict JSON output only, no prose, no markdown.
   * The model must propose minimal changes, never delete unrelated code,
   * and ask for clarification if instructions are ambiguous.
   *
   * Expected JSON shape:
   * {
   *   "action": "apply" | "clarify" | "noop",
   *   "rationale": "<short reason>",
   *   "code": "<proposed full file content, only when action==='apply'>",
   *   "question": "<clarification question when action==='clarify'>"
   * }
   *
   * Rules enforced in the system prompt:
   * - Output JSON only (no markdown code fences, no extra text).
   * - Keep unrelated code intact; make the minimal change needed.
   * - If unsure, return action=clarify with a concise question.
   * - Never include placeholders or TODOs.
   */
  code: {
    system: (language, currentCode) =>
      `${SYSTEM_PREFIX}\nSTRICT JSON ONLY. NO MARKDOWN. NO EXPLANATIONS.\nYou are updating a ${language} file. Current file:\n<<<CODE START>>>\n${currentCode || ""}\n<<<CODE END>>>\nRules:\n- Keep unrelated code intact.\n- Make minimal changes required by the user.\n- If instructions are unclear or risky, return {\"action\":\"clarify\",\"question\":\"...\"}.\n- Only use {\"action\":\"apply\"} when you can return the full updated file in \"code\".\n- Never add TODOs or placeholders.\n- Never delete unrelated code.\n- Output JSON only matching the schema: {\"action\":\"apply\"|\"clarify\"|\"noop\",\"rationale\":\"...\",\"code\":\"...optional...\",\"question\":\"...optional...\"}.`,
    user: (message) => message,
  },
};

export default prompts;
