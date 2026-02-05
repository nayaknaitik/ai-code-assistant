import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { authMiddleware, requireAuth } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { fileRoutes } from "./routes/file.routes.js";
import { initDb } from "./db/pg.js";

const fastify = Fastify({ logger: config.isDev });

await fastify.register(cors, {
  origin: config.isDev ? true : process.env.FRONTEND_URL || true,
  credentials: true,
});

await fastify.register(rateLimit, {
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
});

fastify.decorate("requireAuth", requireAuth);
fastify.addHook("preHandler", authMiddleware);

await initDb();

await fastify.register(authRoutes);
await fastify.register(aiRoutes, { prefix: "/ai" });
await fastify.register(fileRoutes);

fastify.get("/health", async () => ({ ok: true }));

fastify.setErrorHandler((err, request, reply) => {
  request.log.error(err);
  reply.status(err.statusCode || 500).send({
    error: err.message || "Internal server error",
  });
});

try {
  await fastify.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server listening on http://0.0.0.0:${config.port}`);
} catch (e) {
  fastify.log.error(e);
  process.exit(1);
}
