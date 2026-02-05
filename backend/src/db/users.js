import { nanoid } from "nanoid";
import { pool } from "./pg.js";

export const userStore = {
  async create(data) {
    const user = {
      id: nanoid(),
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
    };
    await pool.query(
      `INSERT INTO users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, user.passwordHash, user.createdAt]
    );
    return user;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEmail(email) {
    const normalized = email.toLowerCase().trim();
    const { rows } = await pool.query(
      `SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
       FROM users WHERE email = $1`,
      [normalized]
    );
    return rows[0] ?? null;
  },
};
