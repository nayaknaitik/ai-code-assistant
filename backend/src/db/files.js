import { nanoid } from "nanoid";
import { pool } from "./pg.js";

export const fileStore = {
  async upsert({ id, userId, filename, language, content }) {
    const now = new Date().toISOString();
    const fileId = id || nanoid();
    if (id) {
      const existing = await pool.query(
        `SELECT user_id AS "userId" FROM files WHERE id = $1`,
        [id]
      );
      const ownerId = existing.rows[0]?.userId;
      if (ownerId && ownerId !== userId) {
        const err = new Error("Forbidden");
        err.code = "FORBIDDEN";
        throw err;
      }
    }
    const record = {
      id: fileId,
      userId,
      filename: filename?.trim() || "Untitled",
      language: language || "plaintext",
      content: content ?? "",
      updatedAt: now,
    };
    await pool.query(
      `INSERT INTO files (id, user_id, filename, language, content, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         filename = EXCLUDED.filename,
         language = EXCLUDED.language,
         content = EXCLUDED.content,
         updated_at = EXCLUDED.updated_at
       WHERE files.user_id = EXCLUDED.user_id`,
      [record.id, record.userId, record.filename, record.language, record.content, record.updatedAt]
    );
    return record;
  },

  async listByUser(userId) {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", filename, language, content,
              updated_at AS "updatedAt"
       FROM files
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", filename, language, content,
              updated_at AS "updatedAt"
       FROM files
       WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async delete(id) {
    const { rowCount } = await pool.query(
      `DELETE FROM files WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  },
};
