/**
 * AI routes: optional auth (guest allowed). All /ai/* use same error handling and logging.
 */
import { aiService } from "../services/ai.service.js";

function isConfigError(e) {
  const msg = (e?.message || "").toLowerCase();
  return msg.includes("groq") || msg.includes("api key") || msg.includes("not set");
}

function handleAiError(request, reply, e, action) {
  request.log.warn({ err: e, action }, "AI route error");
  const message = e?.message || "AI request failed";
  if (isConfigError(e)) {
    return reply.status(503).send({
      error: "AI service not configured",
      detail: "Set GROQ_API_KEY in backend/.env (get a key at console.groq.com)",
    });
  }
  return reply.status(502).send({
    error: "AI service temporarily unavailable",
    detail: message,
  });
}

export async function aiRoutes(fastify) {
  fastify.post("/explain", async (request, reply) => {
    const { code, language } = request.body || {};
    request.log.info({ path: "/ai/explain", hasCode: !!code }, "AI request");
    if (!code) return reply.status(400).send({ error: "code required" });
    try {
      return await aiService.explain(code, language || "text");
    } catch (e) {
      return handleAiError(request, reply, e, "explain");
    }
  });

  fastify.post("/bugs", async (request, reply) => {
    const { code, language } = request.body || {};
    request.log.info({ path: "/ai/bugs", hasCode: !!code }, "AI request");
    if (!code) return reply.status(400).send({ error: "code required" });
    try {
      return await aiService.findBugs(code, language || "text");
    } catch (e) {
      return handleAiError(request, reply, e, "bugs");
    }
  });

  fastify.post("/refactor", async (request, reply) => {
    const { code, language } = request.body || {};
    request.log.info({ path: "/ai/refactor", hasCode: !!code }, "AI request");
    if (!code) return reply.status(400).send({ error: "code required" });
    try {
      return await aiService.refactor(code, language || "text");
    } catch (e) {
      return handleAiError(request, reply, e, "refactor");
    }
  });

  fastify.post("/optimize", async (request, reply) => {
    const { code, language } = request.body || {};
    request.log.info({ path: "/ai/optimize", hasCode: !!code }, "AI request");
    if (!code) return reply.status(400).send({ error: "code required" });
    try {
      return await aiService.optimize(code, language || "text");
    } catch (e) {
      return handleAiError(request, reply, e, "optimize");
    }
  });

  fastify.post("/convert", async (request, reply) => {
    const { code, fromLanguage, toLanguage } = request.body || {};
    request.log.info({ path: "/ai/convert", hasCode: !!code }, "AI request");
    if (!code || !toLanguage) {
      return reply.status(400).send({ error: "code and toLanguage required" });
    }
    try {
      return await aiService.convert(code, fromLanguage || "text", toLanguage);
    } catch (e) {
      return handleAiError(request, reply, e, "convert");
    }
  });

  fastify.post("/chat", async (request, reply) => {
    const body = request.body || {};
    const { message, editorContent, model, messages, currentCode, language } = body;
    request.log.info({ path: "/ai/chat", hasMessage: !!(message || (messages && messages.length)) }, "AI request");
    if (messages && Array.isArray(messages) && messages.length > 0) {
      try {
        return await aiService.chatWithHistory(
          messages,
          currentCode ?? editorContent ?? "",
          language || "text",
          model
        );
      } catch (e) {
        return handleAiError(request, reply, e, "chat");
      }
    }
    if (!message) return reply.status(400).send({ error: "message required" });
    try {
      return await aiService.chat(message, editorContent || currentCode || "", model);
    } catch (e) {
      return handleAiError(request, reply, e, "chat");
    }
  });

  fastify.post("/chat-code", async (request, reply) => {
    const { message, currentCode, language, model } = request.body || {};
    request.log.info({ path: "/ai/chat-code", hasMessage: !!message }, "AI request");
    if (!message) return reply.status(400).send({ error: "message required" });
    try {
      return await aiService.chatCode(message, currentCode || "", language || "text", model);
    } catch (e) {
      return handleAiError(request, reply, e, "chat-code");
    }
  });
}
