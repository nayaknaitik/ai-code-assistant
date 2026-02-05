import { fileStore } from "../db/files.js";

export async function fileRoutes(fastify) {
  // All file routes require auth (user attached by middleware + requireAuth)
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.get("/files", async (request) => {
    const userId = request.user.id;
    const files = await fileStore.listByUser(userId);
    return { files };
  });

  fastify.get("/files/:id", async (request, reply) => {
    const { id } = request.params;
    const file = await fileStore.getById(id);
    if (!file || file.userId !== request.user.id) {
      return reply.status(404).send({ error: "File not found" });
    }
    return { file };
  });

  fastify.post("/files", async (request, reply) => {
    const userId = request.user.id;
    const { id, filename, language, content } = request.body || {};
    if (!filename || !filename.trim()) {
      return reply.status(400).send({ error: "filename required" });
    }
    try {
      const saved = await fileStore.upsert({ id, userId, filename, language, content });
      return { file: saved };
    } catch (e) {
      if (e?.code === "FORBIDDEN") {
        return reply.status(403).send({ error: "Forbidden" });
      }
      throw e;
    }
  });

  fastify.delete("/files/:id", async (request, reply) => {
    const id = request.params?.id;
    if (!id) {
      request.log.warn({ reason: "missing_id" }, "delete file failed");
      return reply.status(400).send({ error: "id required" });
    }
    if (!request.user) {
      request.log.warn({ id, reason: "unauthenticated" }, "delete file failed");
      return reply.status(401).send({ error: "Authentication required" });
    }
    const file = await fileStore.getById(id);
    if (!file) {
      request.log.warn({ id, userId: request.user.id, reason: "not_found" }, "delete file failed");
      return reply.status(404).send({ error: "File not found" });
    }
    if (file.userId !== request.user.id) {
      request.log.warn(
        { id, userId: request.user.id, ownerId: file.userId, reason: "forbidden" },
        "delete file failed"
      );
      return reply.status(403).send({ error: "Forbidden" });
    }
    await fileStore.delete(id);
    return { ok: true };
  });
}
