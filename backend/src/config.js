/**
 * Environment-based configuration. Caller must load dotenv before first use (e.g. in index.js).
 */
const env = process.env;

export const config = {
  port: parseInt(env.PORT || "3001", 10),
  nodeEnv: env.NODE_ENV || "development",
  isDev: env.NODE_ENV !== "production",

  jwt: {
    secret: env.JWT_SECRET || "dev-secret-change-in-production",
    expiresIn: env.JWT_EXPIRES_IN || "7d",
  },

  groq: {
    apiKey: (env.GROQ_API_KEY || "").trim(),
    defaultModel: env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
    maxTokens: parseInt(env.GROQ_MAX_TOKENS || "4096", 10),
  },

  rateLimit: {
    max: parseInt(env.RATE_LIMIT_MAX || "30", 10),
    timeWindow: env.RATE_LIMIT_WINDOW || "1 minute",
  },
};
