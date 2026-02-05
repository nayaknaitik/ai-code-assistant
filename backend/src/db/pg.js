import pg from "pg";

const { Pool } = pg;
const env = process.env;

const pool = new Pool({
  connectionString: env.DATABASE_URL || undefined,
  host: env.DB_HOST || "localhost",
  port: env.DB_PORT ? parseInt(env.DB_PORT, 10) : 5432,
  user: env.DB_USER || "postgres",
  password: env.DB_PASSWORD || "postgres",
  database: env.DB_NAME || "ai_code_assistant",
  max: env.DB_POOL_SIZE ? parseInt(env.DB_POOL_SIZE, 10) : 10,
  ssl: env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      language TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
  `);
}

export { pool };
