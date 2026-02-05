import { authService } from "../services/auth.service.js";

export async function authRoutes(fastify) {
  fastify.post("/auth/register", async (request, reply) => {
    const { email, password } = request.body || {};
    if (!email || !password) {
      return reply.status(400).send({ error: "Email and password required" });
    }
    if (password.length < 8) {
      return reply.status(400).send({ error: "Password must be at least 8 characters" });
    }
    try {
      const result = await authService.register(email, password);
      return result;
    } catch (e) {
      if (e.message === "Email already registered") {
        return reply.status(409).send({ error: e.message });
      }
      throw e;
    }
  });

  fastify.post("/auth/login", async (request, reply) => {
    const { email, password } = request.body || {};
    if (!email || !password) {
      return reply.status(400).send({ error: "Email and password required" });
    }
    try {
      const result = await authService.login(email, password);
      return result;
    } catch (e) {
      if (e.message === "Invalid email or password") {
        return reply.status(401).send({ error: e.message });
      }
      throw e;
    }
  });

  fastify.get("/auth/me", { preHandler: [fastify.requireAuth] }, async (request) => {
    return { user: request.user };
  });
}
