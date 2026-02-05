import { aiService } from "../services/ai.service.js";

export async function aiRoutes(fastify) {
  const opts = { preHandler: [fastify.optionalAuth] };

  fastify.post("/explain", opts, async (request, reply) => {
    const { code, language = "text" } = request.body || {};
    if (!code) return reply.code(400).send({ error: "code required" });
    try {
      const result = await aiService.explain(code, language);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });

  fastify.post("/bugs", opts, async (request, reply) => {
    const { code, language = "text" } = request.body || {};
    if (!code) return reply.code(400).send({ error: "code required" });
    try {
      const result = await aiService.findBugs(code, language);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });

  fastify.post("/refactor", opts, async (request, reply) => {
    const { code, language = "text" } = request.body || {};
    if (!code) return reply.code(400).send({ error: "code required" });
    try {
      const result = await aiService.refactor(code, language);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });

  fastify.post("/optimize", opts, async (request, reply) => {
    const { code, language = "text" } = request.body || {};
    if (!code) return reply.code(400).send({ error: "code required" });
    try {
      const result = await aiService.optimize(code, language);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });

  fastify.post("/convert", opts, async (request, reply) => {
    const { code, fromLanguage, toLanguage } = request.body || {};
    if (!code || !fromLanguage || !toLanguage) {
      return reply.code(400).send({ error: "code, fromLanguage, and toLanguage required" });
    }
    try {
      const result = await aiService.convert(code, fromLanguage, toLanguage);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });

  fastify.post("/chat", opts, async (request, reply) => {
    const { message, editorContent, model } = request.body || {};
    if (!message) return reply.code(400).send({ error: "message required" });
    try {
      const result = await aiService.chat(message, editorContent || "", model);
      return result;
    } catch (e) {
      if (e.message?.includes("GROQ_API_KEY")) {
        return reply.code(503).send({ error: "AI service not configured" });
      }
      throw e;
    }
  });
}
